#![cfg_attr(target_arch = "wasm32", no_std)]

extern crate alloc;

use aidoku::{
	Chapter, ContentRating, DeepLinkHandler, DeepLinkResult, DynamicSettings, ImageRequestProvider,
	Listing, ListingProvider, Manga, MangaPageResult, MangaStatus, Page, PageContent, Result,
	Setting, Source, TextSetting, UpdateStrategy, Viewer,
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

use parser::{GalleryKey, extract_gallery_keys, extract_next_path, parse_gallery_key};

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
struct MpvPage {
	k: String,
	t: Option<String>,
}

#[derive(Debug, Deserialize)]
struct MpvImage {
	i: String,
}

type GalleryResponse = (Vec<Thumbnail>, Vec<String>, Option<GalleryInfo>);
type MpvDataResponse = (Vec<MpvPage>, String, String);

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
		let (pages, mpvkey, _title): MpvDataResponse =
			request_with_cookie(&format!("{}/api/mpvdata/{}/{}", BASE_URL, key.gid, key.token))?
				.json_owned()?;
		let mut result = Vec::new();
		for (index, page) in pages.into_iter().enumerate() {
			let page_number = index + 1;
			let api_url = format!(
				"{}/api/mpv/{}/{}/{}/{}",
				BASE_URL, key.gid, page_number, page.k, mpvkey
			);
			let mut context = HashMap::new();
			context.insert(
				"referer".into(),
				format!("{}/g/{}/{}/", BASE_URL, key.gid, key.token),
			);
			result.push(Page {
				content: PageContent::url_context(api_url, context),
				thumbnail: page.t.map(|url| normalize_gallery_image_url(&url)),
				has_description: false,
				description: None,
			});
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
			"imageset" => "/imageset",
			"cosplay" => "/cosplay",
			_ => return Err(AidokuError::message("Unknown EXMirror listing")),
		};
		self.get_manga_page_from_path(path.into(), page)
	}
}

impl DynamicSettings for ExMirror {
	fn get_dynamic_settings(&self) -> Result<Vec<Setting>> {
		Ok(vec![
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
		])
	}
}

impl ImageRequestProvider for ExMirror {
	fn get_image_request(
		&self,
		url: String,
		context: Option<aidoku::PageContext>,
	) -> Result<Request> {
		if url.starts_with(&format!("{}/api/mpv/", BASE_URL)) {
			let image: MpvImage = request_with_cookie(&url)?.json_owned()?;
			let image_url = normalize_gallery_image_url(&image.i);
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
		let keys = extract_gallery_keys(&html);
		if keys.is_empty() && html.contains("/login") {
			return Err(AidokuError::message(
				"EXMirror requires ipb_member_id, ipb_pass_hash, and igneous in source settings.",
			));
		}
		if let Some(next_path) = extract_next_path(&html) {
			defaults_set(
				&next_cache_key(&base_path, page + 1),
				DefaultValue::String(next_path),
			);
		}

		let mut entries = Vec::new();
		for key in keys {
			match self.manga_from_key(&key) {
				Ok(manga) => entries.push(manga),
				Err(_) => entries.push(Manga {
					key: key.as_key(),
					title: key.as_key(),
					url: Some(format!("{}/g/{}/{}/", BASE_URL, key.gid, key.token)),
					content_rating: ContentRating::NSFW,
					viewer: Viewer::RightToLeft,
					update_strategy: UpdateStrategy::Never,
					..Default::default()
				}),
			}
		}

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
	request.set_header("Referer", BASE_URL);
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
	Ok(format!(
		"ipb_member_id={}; ipb_pass_hash={}; igneous={}",
		member_id, pass_hash, igneous
	))
}

fn required_setting(key: &str) -> Result<String> {
	defaults_get::<String>(key)
		.map(|value| value.trim().to_string())
		.filter(|value| !value.is_empty())
		.ok_or_else(|| AidokuError::message(format!("Missing EXMirror setting: {}", key)))
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
	DeepLinkHandler
);
