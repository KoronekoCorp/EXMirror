use aidoku::alloc::{String, Vec};
use aidoku::prelude::*;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct GalleryKey {
	pub gid: String,
	pub token: String,
}

impl GalleryKey {
	pub fn as_key(&self) -> String {
		format!("{}/{}", self.gid, self.token)
	}
}

pub fn parse_gallery_key(input: &str) -> Option<GalleryKey> {
	let normalized = input.replace("\\/", "/");
	let mut path = normalized.as_str();
	for prefix in [
		"https://ex.elysia.rip",
		"https://exhentai.org",
		"https://e-hentai.org",
	] {
		if let Some(rest) = path.strip_prefix(prefix) {
			path = rest;
			break;
		}
	}
	let start = path.find("/g/")?;
	let mut parts = path[start + 3..].splitn(3, '/');
	let gid = clean_segment(parts.next()?)?;
	let token = clean_segment(parts.next()?)?;
	if gid.bytes().all(|b| b.is_ascii_digit()) {
		Some(GalleryKey { gid, token })
	} else {
		None
	}
}

pub fn extract_gallery_keys(html: &str) -> Vec<GalleryKey> {
	let normalized = html.replace("\\/", "/");
	let mut keys = Vec::new();
	let mut rest = normalized.as_str();
	while let Some(index) = rest.find("/g/") {
		rest = &rest[index..];
		if let Some(key) = parse_gallery_key(rest)
			&& !keys.iter().any(|existing: &GalleryKey| existing == &key)
		{
			keys.push(key);
		}
		rest = &rest[3..];
	}
	keys
}

pub fn extract_next_path(html: &str) -> Option<String> {
	let normalized = html.replace("\\/", "/");
	find_next_href(&normalized).map(|href| to_mirror_path(&href))
}

fn clean_segment(segment: &str) -> Option<String> {
	let value = segment
		.split(['?', '#', '"', '\'', '<', '>', '&', '\\'])
		.next()
		.unwrap_or_default()
		.trim_matches('/');
	if value.is_empty() {
		None
	} else {
		Some(value.into())
	}
}

fn read_quoted_value(input: &str) -> Option<String> {
	let mut chars = input.chars();
	let quote = chars.next()?;
	if quote != '"' && quote != '\'' {
		return None;
	}
	let mut value = String::new();
	for ch in chars {
		if ch == quote {
			return Some(value);
		}
		value.push(ch);
	}
	None
}

fn find_next_href(html: &str) -> Option<String> {
	let mut rest = html;
	while let Some(href_index) = rest.find("href=") {
		let after = &rest[href_index + 5..];
		if let Some(href) = read_quoted_value(after) {
			let path = to_mirror_path(&href);
			if has_next_query(&path) {
				return Some(path);
			}
		}
		rest = advance_one_char(after)?;
	}
	None
}

fn advance_one_char(input: &str) -> Option<&str> {
	let mut chars = input.char_indices();
	chars.next()?;
	let offset = chars.next().map(|(index, _)| index).unwrap_or(input.len());
	Some(&input[offset..])
}

fn has_next_query(path: &str) -> bool {
	path.contains("?next=") || path.contains("&next=")
}

fn to_mirror_path(href: &str) -> String {
	let mut value = href.replace("&amp;", "&");
	for prefix in [
		"https://ex.elysia.rip",
		"https://exhentai.org",
		"https://e-hentai.org",
	] {
		if value.starts_with(prefix) {
			value = value[prefix.len()..].into();
			break;
		}
	}
	if value.starts_with("/?") {
		format!("/i{}", &value[1..])
	} else if value == "/" {
		"/i".into()
	} else {
		value
	}
}

#[cfg(test)]
mod tests {
	use super::*;
	use aidoku::alloc::vec;
	use aidoku_test::aidoku_test;

	#[aidoku_test]
	fn parses_gallery_key_from_absolute_and_relative_urls() {
		assert_eq!(
			parse_gallery_key("https://ex.elysia.rip/g/12345/abcdef/"),
			Some(GalleryKey {
				gid: "12345".into(),
				token: "abcdef".into(),
			})
		);
		assert_eq!(
			parse_gallery_key("/g/67890/token_2?fav=true"),
			Some(GalleryKey {
				gid: "67890".into(),
				token: "token_2".into(),
			})
		);
	}

	#[aidoku_test]
	fn extracts_unique_gallery_keys_in_order() {
		let html = r#"
			<a href="/g/100/aaa/">first</a>
			<a href="https://ex.elysia.rip/g/200/bbb/">second</a>
			<a href="/g/100/aaa/">duplicate</a>
			<a href="https://exhentai.org/g/300/ccc/">third</a>
		"#;

		assert_eq!(
			extract_gallery_keys(html),
			vec![
				GalleryKey {
					gid: "100".into(),
					token: "aaa".into(),
				},
				GalleryKey {
					gid: "200".into(),
					token: "bbb".into(),
				},
				GalleryKey {
					gid: "300".into(),
					token: "ccc".into(),
				},
			]
		);
	}

	#[aidoku_test]
	fn extracts_next_page_path_from_mirror_or_exhentai_links() {
		let html = r#"
			<a id="dprev" href="/i?prev=1">Prev</a>
			<a id="dnext" href="https://exhentai.org/?next=abc">Next</a>
		"#;

		assert_eq!(extract_next_path(html), Some("/i?next=abc".into()));
	}

	#[aidoku_test]
	fn extracts_next_page_path_from_mirror_markup_with_non_ascii_text() {
		let html = r#"
			<div>下一页 漫画 画像 テスト</div>
			<a class="MuiButtonBase-root" href="/imageset?next=abc&amp;f_search=%E6%B5%8B%E8%AF%95">下一页</a>
		"#;

		assert_eq!(
			extract_next_path(html),
			Some("/imageset?next=abc&f_search=%E6%B5%8B%E8%AF%95".into())
		);
	}
}
