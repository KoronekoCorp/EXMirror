use aidoku::alloc::{String, Vec};
use aidoku::prelude::*;

const MAX_LISTING_ITEMS: usize = 60;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct GalleryKey {
	pub gid: String,
	pub token: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct GalleryListItem {
	pub key: GalleryKey,
	pub title: Option<String>,
	pub cover: Option<String>,
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
	let normalized = normalize_listing_markup(html);
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

pub fn extract_gallery_items(html: &str) -> Vec<GalleryListItem> {
	let mut items = Vec::new();
	let mut rest = html;
	while let Some((index, marker_len)) = find_gallery_marker(rest) {
		let item_start = &rest[index..];
		let window = normalize_listing_markup(utf8_prefix(item_start, 8_000));
		if let Some(key) = parse_gallery_key(&window)
			&& !items
				.iter()
				.any(|existing: &GalleryListItem| existing.key == key)
		{
			items.push(GalleryListItem {
				key,
				title: extract_flight_title(&window)
					.or_else(|| extract_html_class_text(&window, "glink"))
					.or_else(|| extract_html_attr_after(&window, "title=")),
				cover: extract_flight_src(&window).or_else(|| extract_html_attr_after(&window, "src=")),
			});
			if items.len() >= MAX_LISTING_ITEMS {
				break;
			}
		}
		rest = &rest[index + marker_len..];
	}
	items
}

pub fn extract_next_path(html: &str) -> Option<String> {
	let normalized = normalize_listing_markup(html);
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

fn find_gallery_marker(input: &str) -> Option<(usize, usize)> {
	let patterns = [
		"/g/",
		"\\/g\\/",
		"\\\\/g\\\\/",
		"\\\\\\/g\\\\\\/",
		"\\u002Fg\\u002F",
		"\\u002fg\\u002f",
		"\\\\u002Fg\\\\u002F",
		"\\\\u002fg\\\\u002f",
	];
	let mut best: Option<(usize, usize)> = None;
	for pattern in patterns {
		if let Some(index) = input.find(pattern)
			&& best
				.map(|(best_index, _)| index < best_index)
				.unwrap_or(true)
		{
			best = Some((index, pattern.len()));
		}
	}
	best
}

fn normalize_listing_markup(html: &str) -> String {
	let mut output: String = html.into();
	for _ in 0..4 {
		let next = output
			.replace("\\\\/", "/")
			.replace("\\/", "/")
			.replace("\\\\\"", "\"")
			.replace("\\\"", "\"")
			.replace("\\\\u002F", "/")
			.replace("\\\\u002f", "/")
			.replace("\\u002F", "/")
			.replace("\\u002f", "/")
			.replace("\\u0026", "&")
			.replace("\\u003c", "<")
			.replace("\\u003e", ">");
		if next == output {
			break;
		}
		output = next;
	}
	output
}

pub fn gallery_marker_diagnostics(html: &str) -> String {
	format!(
		"len={}, /g/={}, \\/g\\/={}, \\\\/g\\\\/={}, u002Fg={}",
		html.len(),
		count_occurrences(html, "/g/"),
		count_occurrences(html, "\\/g\\/"),
		count_occurrences(html, "\\\\/g\\\\/"),
		count_occurrences(html, "\\u002Fg\\u002F") + count_occurrences(html, "\\u002fg\\u002f"),
	)
}

fn count_occurrences(input: &str, pattern: &str) -> usize {
	if pattern.is_empty() {
		return 0;
	}
	let mut count = 0;
	let mut rest = input;
	while let Some(index) = rest.find(pattern) {
		count += 1;
		rest = &rest[index + pattern.len()..];
	}
	count
}

fn utf8_prefix(input: &str, max_bytes: usize) -> &str {
	if input.len() <= max_bytes {
		input
	} else {
		let mut end = max_bytes;
		while end > 0 && !input.is_char_boundary(end) {
			end -= 1;
		}
		&input[..end]
	}
}

fn extract_flight_title(window: &str) -> Option<String> {
	let marker_index = window.find("\"variant\":\"h5\"")?;
	let title_area = &window[marker_index..];
	let value = extract_json_string_after(title_area, "\"children\":\"")?;
	let title = decode_text(&value);
	if title.is_empty() { None } else { Some(title) }
}

fn extract_flight_src(window: &str) -> Option<String> {
	extract_json_string_after(window, "\"src\":\"").filter(|value| {
		value.starts_with("http://") || value.starts_with("https://") || value.starts_with("//")
	})
}

fn extract_html_class_text(input: &str, class_name: &str) -> Option<String> {
	let marker = format!("class=\"{}\"", class_name);
	let class_index = input.find(&marker)?;
	let after_class = &input[class_index + marker.len()..];
	let text_start = after_class.find('>')? + 1;
	let after_start = &after_class[text_start..];
	let text_end = after_start.find('<')?;
	let value = decode_text(&after_start[..text_end]);
	if value.is_empty() { None } else { Some(value) }
}

fn extract_html_attr_after(input: &str, marker: &str) -> Option<String> {
	let marker_index = input.find(marker)? + marker.len();
	read_quoted_value(&input[marker_index..]).and_then(|value| {
		let decoded = decode_text(&value);
		if decoded.is_empty() {
			None
		} else {
			Some(decoded)
		}
	})
}

fn extract_json_string_after(input: &str, marker: &str) -> Option<String> {
	let start = input.find(marker)? + marker.len();
	let mut output = String::new();
	let mut escaped = false;
	for ch in input[start..].chars() {
		if escaped {
			match ch {
				'"' | '\\' | '/' => output.push(ch),
				'n' => output.push('\n'),
				'r' => output.push('\r'),
				't' => output.push('\t'),
				_ => {
					output.push('\\');
					output.push(ch);
				}
			}
			escaped = false;
		} else if ch == '\\' {
			escaped = true;
		} else if ch == '"' {
			return Some(output);
		} else {
			output.push(ch);
		}
	}
	None
}

fn decode_text(input: &str) -> String {
	input
		.replace("\\&", "&")
		.replace("&amp;", "&")
		.replace("&lt;", "<")
		.replace("&gt;", ">")
		.trim()
		.into()
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
	fn extracts_gallery_items_from_next_flight_markup() {
		let html = r#"
			<script>self.__next_f.push([1,"[[\"$\",\"$L1a\",\"https:\/\/exhentai.org\/g\/3922170\/7bba4e0855\/\",{\"children\":[[\"$\",\"$L1b\",null,{\"href\":\"\/g\/3922170\/7bba4e0855\/\",\"children\":[[\"$\",\"img\",null,{\"src\":\"https:\/\/ehgt.org\/w\/02\/379\/73313-4yr5rheq.webp\"}],[\"$\",\"$L20\",null,{\"component\":\"div\",\"variant\":\"h5\",\"children\":\"[Toguchi Masaya] Uruwashi no Wife [Chinese] [为鱼氏汉化\\u0026amp;無修]\"}]]}]]}]]"])</script>
		"#;

		assert_eq!(
			extract_gallery_items(html),
			vec![GalleryListItem {
				key: GalleryKey {
					gid: "3922170".into(),
					token: "7bba4e0855".into(),
				},
				title: Some(
					"[Toguchi Masaya] Uruwashi no Wife [Chinese] [为鱼氏汉化&無修]".into()
				),
				cover: Some("https://ehgt.org/w/02/379/73313-4yr5rheq.webp".into()),
			}]
		);
	}

	#[aidoku_test]
	fn extracts_gallery_items_from_escaped_gallery_markers() {
		let html = r#"
			<script>"href":"\\/g\\/3922170\\/7bba4e0855\\/","src":"https:\\/\\/ehgt.org\\/w\\/cover.webp","variant":"h5","children":"Escaped Title"</script>
		"#;

		let items = extract_gallery_items(html);
		assert_eq!(items.len(), 1);
		assert_eq!(
			items[0],
			GalleryListItem {
				key: GalleryKey {
					gid: "3922170".into(),
					token: "7bba4e0855".into(),
				},
				title: Some("Escaped Title".into()),
				cover: Some("https://ehgt.org/w/cover.webp".into()),
			}
		);
	}

	#[aidoku_test]
	fn extracts_gallery_items_from_unicode_escaped_slashes() {
		let html = r#"
			<script>"href":"\u002Fg\u002F3922170\u002F7bba4e0855\u002F","src":"https:\u002F\u002Fehgt.org\u002Fw\u002Fcover.webp","variant":"h5","children":"Unicode Escaped Title"</script>
		"#;

		let items = extract_gallery_items(html);
		assert_eq!(items.len(), 1);
		assert_eq!(
			items[0],
			GalleryListItem {
				key: GalleryKey {
					gid: "3922170".into(),
					token: "7bba4e0855".into(),
				},
				title: Some("Unicode Escaped Title".into()),
				cover: Some("https://ehgt.org/w/cover.webp".into()),
			}
		);
	}

	#[aidoku_test]
	fn extracts_gallery_items_from_exhentai_table_markup() {
		let html = r#"
			<table class="itg glte"><tr>
				<td class="gl1e"><div><a href="https://exhentai.org/g/3922170/7bba4e0855/"><img src="https://s.exhentai.org/t/01/abc.jpg" title="thumbnail title"/></a></div></td>
				<td class="gl2e"><div><div><div>DOUJINSHI</div></div><div><a href="https://exhentai.org/g/3922170/7bba4e0855/"><div class="glink">Classic &amp; Title</div></a></div></div></td>
			</tr></table>
		"#;

		assert_eq!(
			extract_gallery_items(html),
			vec![GalleryListItem {
				key: GalleryKey {
					gid: "3922170".into(),
					token: "7bba4e0855".into(),
				},
				title: Some("Classic & Title".into()),
				cover: Some("https://s.exhentai.org/t/01/abc.jpg".into()),
			}]
		);
	}

	#[aidoku_test]
	fn extracts_gallery_items_without_cutting_utf8_boundary() {
		let mut html = String::from(r#"<a href="/g/3922553/5327ce4046/">"#);
		while html.len() < 7_998 {
			html.push('a');
		}
		html.push_str("废弃内容");
		html.push_str(r#"<img src="https://s.exhentai.org/w/02/380/11648.webp" title="黑丝女警队 7" />"#);

		let items = extract_gallery_items(&html);
		assert_eq!(items.len(), 1);
		assert_eq!(
			items[0].key,
			GalleryKey {
				gid: "3922553".into(),
				token: "5327ce4046".into(),
			}
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
