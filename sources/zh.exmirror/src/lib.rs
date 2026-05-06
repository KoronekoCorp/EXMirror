#![cfg_attr(target_arch = "wasm32", no_std)]

extern crate alloc;

use aidoku::{
	Chapter, ContentRating, DeepLinkHandler, DeepLinkResult, DynamicSettings, ImageRequestProvider,
	Listing, ListingProvider, LoginMethod, LoginSetting, Manga, MangaPageResult, MangaStatus, Page,
	PageContent, Result, Setting, Source, TextSetting, UpdateStrategy, Viewer, WebLoginHandler,
	alloc::{
		String, Vec,
		borrow::Cow,
		format,
		string::{String as AidokuString, ToString},
		vec,
	},
	imports::{
		defaults::{DefaultValue, defaults_get, defaults_set},
		error::AidokuError,
		net::Request,
	},
	prelude::*,
	HashMap,
};
use serde::Deserialize;

mod parser;

use parser::{
	GalleryKey, GalleryListItem, extract_gallery_items, extract_gallery_keys, extract_next_path,
	gallery_marker_diagnostics, parse_gallery_key,
};

const BASE_URL: &str = "https://ex.elysia.rip";
const USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36";

struct ExMirror;

#[derive(Debug, Deserialize)]
struct Thumbnail {
	url: String,
}

#[derive(Debug, Deserialize)]
struct GalleryInfo {
	#[serde(rename = "Posted")]
	posted: Option<String>,
	#[serde(rename = "File Size")]
	file_size: Option<String>,
	#[serde(rename = "Length")]
	length: Option<u32>,
	catalog: Option<String>,
	uploader: Option<String>,
	tags: Option<Vec<String>>,
	lowtag: Option<Vec<String>>,
	#[serde(rename = "Average")]
	average: Option<String>,
	gn: Option<String>,
	gj: Option<String>,
}

#[derive(Debug, Deserialize)]
struct SinglePageResponse {
	url: String,
}

type GalleryResponse = (Vec<Thumbnail>, Vec<String>, Option<GalleryInfo>);
type GalleryPageResponse = (Vec<Thumbnail>, Vec<String>);

impl Source for ExMirror {
	fn new() -> Self {
		Self
	}

	fn get_search_manga_list(
		&self,
		query: Option<String>,
		page: i32,
		_filters: Vec<aidoku::FilterValue>,
	) -> Result<MangaPageResult> {
		let base_path = match query.filter(|value| !value.trim().is_empty()) {
			Some(query) => format!("/i?f_search={}", encode_query_value(&query)),
			None => "/i".into(),
		};
		self.get_manga_page_from_path(base_path, page)
	}

	fn get_manga_update(
		&self,
		manga: Manga,
		needs_details: bool,
		needs_chapters: bool,
	) -> Result<Manga> {
		let key = key_from_manga_key(&manga.key)?;
		let mut updated = if needs_details {
			self.manga_from_key(&key)?
		} else {
			manga
		};
		if needs_chapters {
			updated.chapters = Some(vec![Chapter {
				key: "gallery".into(),
				title: Some(updated.title.clone()),
				chapter_number: Some(1.0),
				volume_number: None,
				date_uploaded: None,
				scanlators: None,
				url: Some(format!("{}/g/{}/{}/", BASE_URL, key.gid, key.token)),
				language: Some("zh".into()),
				thumbnail: updated.cover.clone(),
				locked: false,
			}]);
		}
		Ok(updated)
	}

	fn get_page_list(&self, manga: Manga, _chapter: Chapter) -> Result<Vec<Page>> {
		let key = key_from_manga_key(&manga.key)?;
		let (thumbnails, page_urls, info): GalleryResponse =
			request_with_cookie(&format!("{}/api/g/{}/{}?p=0", BASE_URL, key.gid, key.token))?
				.json_owned()?;
		let total_pages = info
			.and_then(|value| value.length)
			.unwrap_or(page_urls.len() as u32) as usize;
		let per_gallery_page = core::cmp::max(page_urls.len(), 1);

		let mut result = Vec::new();
		append_gallery_pages(&mut result, page_urls, thumbnails)?;

		let gallery_page_count = total_pages.div_ceil(per_gallery_page);
		for gallery_page in 1..gallery_page_count {
			let (thumbnails, page_urls): GalleryPageResponse = request_with_cookie(&format!(
				"{}/api/g/{}/{}?p={}",
				BASE_URL, key.gid, key.token, gallery_page
			))?
			.json_owned()?;
			append_gallery_pages(&mut result, page_urls, thumbnails)?;
		}
		Ok(result)
	}
}

impl ListingProvider for ExMirror {
	fn get_manga_list(&self, listing: Listing, page: i32) -> Result<MangaPageResult> {
		let path = match listing.id.as_str() {
			"popular" => "/popular",
			"watched" => "/watched",
			"favorites" => "/favorites",
			_ => return Err(AidokuError::message("Unknown EXMirror listing")),
		};
		self.get_manga_page_from_path(path.into(), page)
	}
}

impl DynamicSettings for ExMirror {
	fn get_dynamic_settings(&self) -> Result<Vec<Setting>> {
		Ok(vec![
			LoginSetting {
				key: Cow::Borrowed("exmirror_login"),
				title: Cow::Borrowed("EXMirror Web Login"),
				method: LoginMethod::Web,
				url: Some(Cow::Borrowed("https://ex.elysia.rip/login")),
				logout_title: Some(Cow::Borrowed("Clear EXMirror Login")),
				refreshes: Some(vec![Cow::Borrowed("content"), Cow::Borrowed("listings")]),
				..Default::default()
			}
			.into(),
			text_setting(
				"ipb_member_id",
				"ipb_member_id",
				"ExHentai cookie ipb_member_id",
				true,
			),
			text_setting(
				"ipb_pass_hash",
				"ipb_pass_hash",
				"ExHentai cookie ipb_pass_hash",
				true,
			),
			text_setting("igneous", "igneous", "ExHentai cookie igneous", true),
			text_setting("sk", "sk", "Optional ExHentai cookie sk", true),
		])
	}
}

impl WebLoginHandler for ExMirror {
	fn handle_web_login(&self, _key: String, cookies: HashMap<String, String>) -> Result<bool> {
		let mut accepted = true;
		for key in ["ipb_member_id", "ipb_pass_hash", "igneous"] {
			if let Some(value) = cookies.get(key).and_then(|value| clean_setting_value(value)) {
				defaults_set(key, DefaultValue::String(value));
			} else {
				accepted = false;
			}
		}
		if let Some(value) = cookies.get("sk").and_then(|value| clean_setting_value(value)) {
			defaults_set("sk", DefaultValue::String(value));
		}
		Ok(accepted)
	}
}

impl ImageRequestProvider for ExMirror {
	fn get_image_request(
		&self,
		url: String,
		context: Option<aidoku::PageContext>,
	) -> Result<Request> {
		if url.starts_with(&format!("{}/api/s/", BASE_URL)) {
			let image: SinglePageResponse = request_with_cookie(&url)?.json_owned()?;
			let image_url = normalize_gallery_image_url(&image.url);
			return image_request(&image_url, context);
		}
		image_request(&url, context)
	}
}

impl DeepLinkHandler for ExMirror {
	fn handle_deep_link(&self, url: String) -> Result<Option<DeepLinkResult>> {
		Ok(parse_gallery_key(&url).map(|key| DeepLinkResult::Manga { key: key.as_key() }))
	}
}

impl ExMirror {
	fn get_manga_page_from_path(&self, base_path: String, page: i32) -> Result<MangaPageResult> {
		let page = core::cmp::max(page, 1);
		let path = if page <= 1 {
			base_path.clone()
		} else {
			match defaults_get::<String>(&next_cache_key(&base_path, page)) {
				Some(path) => path,
				None => {
					return Ok(MangaPageResult {
						entries: Vec::new(),
						has_next_page: false,
					});
				}
			}
		};

		let html = request_with_cookie(&absolute_url(&path))?.string()?;
		let items = extract_gallery_items(&html);
		if items.is_empty() && is_login_or_auth_page(&html) {
			return Err(AidokuError::message(
				"EXMirror returned a login page. Check ipb_member_id, ipb_pass_hash, and igneous in source settings.",
			));
		}
		if let Some(next_path) = extract_next_path(&html) {
			defaults_set(
				&next_cache_key(&base_path, page + 1),
				DefaultValue::String(next_path),
			);
		}

		let entries = if items.is_empty() {
			let keys = extract_gallery_keys(&html);
			if keys.is_empty() {
				return Err(AidokuError::message(format!(
					"EXMirror listing returned no gallery entries. {}",
					gallery_marker_diagnostics(&html)
				)));
			}
			keys.into_iter()
				.map(|key| self.manga_from_key(&key).unwrap_or_else(|_| fallback_manga(&key)))
				.collect()
		} else {
			items.iter().map(manga_from_list_item).collect()
		};

		Ok(MangaPageResult {
			entries,
			has_next_page: extract_next_path(&html).is_some(),
		})
	}

	fn manga_from_key(&self, key: &GalleryKey) -> Result<Manga> {
		let (thumbnails, _page_urls, info): GalleryResponse =
			request_with_cookie(&format!("{}/api/g/{}/{}?p=0", BASE_URL, key.gid, key.token))?
				.json_owned()?;
		let info = info.ok_or_else(|| AidokuError::message("Missing gallery metadata"))?;
		Ok(manga_from_info(key, thumbnails.first(), info))
	}
}

fn manga_from_list_item(item: &GalleryListItem) -> Manga {
	Manga {
		key: item.key.as_key(),
		title: item
			.title
			.clone()
			.unwrap_or_else(|| item.key.as_key()),
		cover: item
			.cover
			.as_ref()
			.map(|url| normalize_gallery_image_url(url)),
		url: Some(format!(
			"{}/g/{}/{}/",
			BASE_URL, item.key.gid, item.key.token
		)),
		content_rating: ContentRating::NSFW,
		viewer: Viewer::RightToLeft,
		update_strategy: UpdateStrategy::Never,
		..Default::default()
	}
}

fn fallback_manga(key: &GalleryKey) -> Manga {
	Manga {
		key: key.as_key(),
		title: key.as_key(),
		url: Some(format!("{}/g/{}/{}/", BASE_URL, key.gid, key.token)),
		content_rating: ContentRating::NSFW,
		viewer: Viewer::RightToLeft,
		update_strategy: UpdateStrategy::Never,
		..Default::default()
	}
}

fn manga_from_info(key: &GalleryKey, thumbnail: Option<&Thumbnail>, info: GalleryInfo) -> Manga {
	let title = info
		.gn
		.clone()
		.filter(|value| !value.is_empty())
		.or(info.gj.clone().filter(|value| !value.is_empty()))
		.unwrap_or_else(|| key.as_key());
	let mut tags = Vec::new();
	if let Some(values) = &info.tags {
		tags.extend(values.iter().cloned());
	}
	if let Some(values) = &info.lowtag {
		tags.extend(values.iter().cloned());
	}
	if let Some(catalog) = info.catalog.clone() {
		tags.push(catalog);
	}

	Manga {
		key: key.as_key(),
		title,
		cover: thumbnail.map(|item| normalize_gallery_image_url(&item.url)),
		artists: info.uploader.clone().map(|value| vec![value]),
		authors: info.uploader.clone().map(|value| vec![value]),
		description: Some(description_from_info(&info)),
		url: Some(format!("{}/g/{}/{}/", BASE_URL, key.gid, key.token)),
		tags: if tags.is_empty() { None } else { Some(tags) },
		status: MangaStatus::Completed,
		content_rating: ContentRating::NSFW,
		viewer: Viewer::RightToLeft,
		update_strategy: UpdateStrategy::Never,
		next_update_time: None,
		chapters: None,
	}
}

fn append_gallery_pages(
	result: &mut Vec<Page>,
	page_urls: Vec<String>,
	thumbnails: Vec<Thumbnail>,
) -> Result<()> {
	for (index, page_url) in page_urls.into_iter().enumerate() {
		let (api_url, referer) = page_api_url(&page_url)?;
		let mut context = HashMap::new();
		context.insert("referer".into(), referer);
		result.push(Page {
			content: PageContent::url_context(api_url, context),
			thumbnail: thumbnails
				.get(index)
				.map(|thumbnail| normalize_gallery_image_url(&thumbnail.url)),
			has_description: false,
			description: None,
		});
	}
	Ok(())
}

fn page_api_url(page_url: &str) -> Result<(String, String)> {
	let path = mirror_path(page_url);
	let mut parts = path.trim_start_matches('/').split('/');
	if parts.next() != Some("s") {
		return Err(AidokuError::message("Invalid EXMirror page URL"));
	}
	let page_token = parts
		.next()
		.ok_or_else(|| AidokuError::message("Missing EXMirror page token"))?;
	let gallery_page = parts
		.next()
		.ok_or_else(|| AidokuError::message("Missing EXMirror page id"))?;
	Ok((
		format!("{}/api/s/{}/{}", BASE_URL, page_token, gallery_page),
		format!("{}/s/{}/{}", BASE_URL, page_token, gallery_page),
	))
}

fn description_from_info(info: &GalleryInfo) -> String {
	let mut lines = Vec::new();
	if let Some(posted) = &info.posted {
		lines.push(format!("Posted: {}", posted));
	}
	if let Some(length) = info.length {
		lines.push(format!("Pages: {}", length));
	}
	if let Some(file_size) = &info.file_size {
		lines.push(format!("File Size: {}", file_size));
	}
	if let Some(average) = &info.average {
		lines.push(average.clone());
	}
	lines.join("\n")
}

fn key_from_manga_key(key: &str) -> Result<GalleryKey> {
	parse_gallery_key(&format!("/g/{}/", key))
		.ok_or_else(|| AidokuError::message("Invalid EXMirror manga key"))
}

fn request_with_cookie(url: &str) -> Result<Request> {
	let cookie = auth_cookie()?;
	let mut request = Request::get(url)?;
	request.set_header("User-Agent", USER_AGENT);
	request.set_header("Cookie".to_string(), cookie);
	request.set_header("Referer", request_referer(url));
	Ok(request)
}

fn image_request(url: &str, context: Option<aidoku::PageContext>) -> Result<Request> {
	let mut request = Request::get(url)?;
	request.set_header("User-Agent", USER_AGENT);
	let referer = context
		.and_then(|value| value.get("referer").cloned())
		.unwrap_or_else(|| BASE_URL.into());
	request.set_header("Referer".to_string(), referer);
	if should_send_cookie(url) {
		request.set_header("Cookie".to_string(), auth_cookie()?);
	}
	Ok(request)
}

fn should_send_cookie(url: &str) -> bool {
	url.starts_with(BASE_URL)
		|| url.starts_with("https://exhentai.org/")
		|| url.starts_with("https://e-hentai.org/")
}

fn auth_cookie() -> Result<String> {
	let member_id = required_setting("ipb_member_id")?;
	let pass_hash = required_setting("ipb_pass_hash")?;
	let igneous = required_setting("igneous")?;
	let mut cookie = format!(
		"ipb_member_id={}; ipb_pass_hash={}; igneous={}",
		member_id, pass_hash, igneous
	);
	if let Some(sk) = optional_setting("sk") {
		cookie.push_str("; sk=");
		cookie.push_str(&sk);
	}
	Ok(cookie)
}

fn required_setting(key: &str) -> Result<String> {
	for setting_key in ["ipb_member_id", "ipb_pass_hash", "igneous"] {
		if let Some(raw) = defaults_get::<String>(setting_key)
			&& let Some(value) = extract_cookie_value(key, &raw)
		{
			return Ok(value);
		}
	}
	defaults_get::<String>(key)
		.and_then(|value| clean_setting_value(&value))
		.ok_or_else(|| AidokuError::message(format!("Missing EXMirror setting: {}", key)))
}

fn optional_setting(key: &str) -> Option<String> {
	for setting_key in ["ipb_member_id", "ipb_pass_hash", "igneous", "sk"] {
		if let Some(raw) = defaults_get::<String>(setting_key)
			&& let Some(value) = extract_cookie_value(key, &raw)
		{
			return Some(value);
		}
	}
	defaults_get::<String>(key).and_then(|value| clean_setting_value(&value))
}

fn clean_setting_value(value: &str) -> Option<String> {
	let cleaned = value
		.trim()
		.trim_matches('"')
		.trim_matches('\'')
		.trim_end_matches(';')
		.trim();
	if cleaned.is_empty() {
		None
	} else {
		Some(cleaned.into())
	}
}

fn extract_cookie_value(key: &str, raw: &str) -> Option<String> {
	let marker = format!("{}=", key);
	let index = raw.find(&marker)? + marker.len();
	let value = raw[index..]
		.split(';')
		.next()
		.unwrap_or_default()
		.trim();
	clean_setting_value(value)
}

fn is_login_or_auth_page(html: &str) -> bool {
	let normalized = html
		.replace("\\/", "/")
		.replace("\\u002F", "/")
		.replace("\\u002f", "/");
	normalized.contains("/login")
		|| normalized.contains("\"Login\"")
		|| normalized.contains(">Login<")
		|| normalized.contains("href=\"/login\"")
		|| normalized.contains("\"url\":\"/login\"")
}

fn text_setting(
	key: &'static str,
	title: &'static str,
	placeholder: &'static str,
	secure: bool,
) -> Setting {
	TextSetting {
		key: Cow::Borrowed(key),
		title: Cow::Borrowed(title),
		placeholder: Some(Cow::Borrowed(placeholder)),
		secure: Some(secure),
		autocapitalization_type: None,
		autocorrection_disabled: Some(true),
		keyboard_type: None,
		return_key_type: None,
		default: None,
		..Default::default()
	}
	.into()
}

fn absolute_url(path: &str) -> String {
	if path.starts_with("http://") || path.starts_with("https://") {
		path.into()
	} else {
		format!("{}{}", BASE_URL, path)
	}
}

fn request_referer(url: &str) -> &'static str {
	if url.starts_with("https://exhentai.org/") {
		"https://exhentai.org/"
	} else if url.starts_with("https://e-hentai.org/") {
		"https://e-hentai.org/"
	} else {
		BASE_URL
	}
}

fn mirror_path(url: &str) -> String {
	let mut value = url.replace("\\/", "/");
	for prefix in [
		BASE_URL,
		"https://exhentai.org",
		"https://e-hentai.org",
	] {
		if let Some(path) = value.strip_prefix(prefix) {
			value = path.into();
			break;
		}
	}
	value.split(['?', '#']).next().unwrap_or_default().into()
}

fn next_cache_key(base_path: &str, page: i32) -> String {
	format!("next:{}:{}", base_path, page)
}

fn encode_query_value(value: &str) -> String {
	let mut output = AidokuString::new();
	for byte in value.bytes() {
		if byte.is_ascii_alphanumeric() || matches!(byte, b'-' | b'_' | b'.' | b'~' | b':') {
			output.push(byte as char);
		} else if byte == b' ' {
			output.push('+');
		} else {
			output.push_str(&format!("%{:02X}", byte));
		}
	}
	output
}

fn normalize_gallery_image_url(url: &str) -> String {
	if url.starts_with("//") {
		format!("https:{}", url)
	} else if url.contains("s.exhentai.org") {
		url.replace("https://s.exhentai.org", "https://ehgt.org")
			.replace("http://s.exhentai.org", "https://ehgt.org")
	} else {
		url.into()
	}
}

register_source!(
	ExMirror,
	ListingProvider,
	DynamicSettings,
	ImageRequestProvider,
	DeepLinkHandler,
	WebLoginHandler
);

#[cfg(test)]
mod tests {
	use super::*;
	use aidoku_test::aidoku_test;

	#[aidoku_test]
	fn builds_single_page_api_url_from_relative_page_url() {
		assert_eq!(
			page_api_url("/s/abc123/3922170-1").unwrap(),
			(
				"https://ex.elysia.rip/api/s/abc123/3922170-1".into(),
				"https://ex.elysia.rip/s/abc123/3922170-1".into()
			)
		);
	}

	#[aidoku_test]
	fn builds_single_page_api_url_from_exhentai_page_url() {
		assert_eq!(
			page_api_url("https://exhentai.org/s/abc123/3922170-1?nl=1").unwrap(),
			(
				"https://ex.elysia.rip/api/s/abc123/3922170-1".into(),
				"https://ex.elysia.rip/s/abc123/3922170-1".into()
			)
		);
	}

	#[aidoku_test]
	fn extracts_cookie_values_from_cookie_fragments() {
		assert_eq!(
			extract_cookie_value("ipb_member_id", "ipb_member_id=12345; ipb_pass_hash=abc"),
			Some("12345".into())
		);
		assert_eq!(
			extract_cookie_value("igneous", "ipb_member_id=12345; igneous=mystery;"),
			Some("mystery".into())
		);
		assert_eq!(
			extract_cookie_value("sk", "ipb_member_id=12345; sk=session-key;"),
			Some("session-key".into())
		);
	}

	#[aidoku_test]
	fn detects_encoded_login_page() {
		assert!(is_login_or_auth_page(r#""href":"\/login","children":"Login""#));
		assert!(is_login_or_auth_page(r#""href":"\u002Flogin","children":"Login""#));
		assert!(is_login_or_auth_page(r#""url":"\/login""#));
		assert!(!is_login_or_auth_page("404: This page could not be found."));
	}

}
