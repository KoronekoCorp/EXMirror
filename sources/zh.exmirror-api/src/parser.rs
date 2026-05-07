use aidoku::alloc::String;
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

#[cfg(test)]
mod tests {
    use super::*;
    use aidoku_test::aidoku_test;

    #[aidoku_test]
    fn parses_gallery_key_from_absolute_and_relative_urls() {
        assert_eq!(
            parse_gallery_key("https://ex.elysia.rip/g/3922170/deadbeef/"),
            Some(GalleryKey {
                gid: "3922170".into(),
                token: "deadbeef".into()
            })
        );
        assert_eq!(
            parse_gallery_key("\\/g\\/3922170\\/deadbeef\\/"),
            Some(GalleryKey {
                gid: "3922170".into(),
                token: "deadbeef".into()
            })
        );
    }
}
