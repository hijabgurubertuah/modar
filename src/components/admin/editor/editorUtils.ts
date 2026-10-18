// ATURAN BAKU: lihat designSystem. UI harus selalu minimalis, bersih, dan tanpa teks petunjuk.

import DOMPurify from 'dompurify';
import { MaterialPage } from '../../../types';

/**
 * Sanitize HTML string using DOMPurify with strict whitelist rules.
 */
export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml) return '';

  const clean = DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: [
      'p', 'h1', 'h2', 'h3', 'h4', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
      'sub', 'sup', 'ul', 'ol', 'li', 'blockquote', 'hr', 'a', 'img',
      'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'span', 'div', 'iframe', 'input'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'style',
      'data-type', 'data-checked', 'data-drive-id', 'type', 'checked', 'disabled', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'referrerpolicy'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });

  return clean;
}

// Add hook for external links, iframe validation, and image data-drive-id / display
if (typeof window !== 'undefined') {
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    // Force rel="noopener noreferrer" on external links
    if (node.tagName === 'A') {
      node.setAttribute('rel', 'noopener noreferrer');
      const href = node.getAttribute('href') || '';
      if (href.startsWith('http')) {
        node.setAttribute('target', '_blank');
      }
    }

    // Validate iframe embeds (YouTube & Google Drive preview only)
    if (node.tagName === 'IFRAME') {
      const src = node.getAttribute('src') || '';
      const allowedDomains = ['youtube.com', 'www.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com', 'drive.google.com'];
      try {
        const parsedUrl = new URL(src);
        const isAllowed = allowedDomains.some((d) => parsedUrl.hostname === d || parsedUrl.hostname.endsWith('.' + d));
        if (!isAllowed) {
          node.setAttribute('src', '');
        } else {
          node.setAttribute('loading', 'lazy');
          node.setAttribute('allowfullscreen', 'true');
          node.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        }
      } catch {
        node.setAttribute('src', '');
      }
    }

    // Ensure images load cached local file IDs if present
    if (node.tagName === 'IMG') {
      const src = node.getAttribute('src') || '';
      if (src.includes('id=local_') || src.includes('id=drive_')) {
        const urlParams = new URLSearchParams(src.split('?')[1] || '');
        const fileId = urlParams.get('id');
        if (fileId) {
          try {
            const cacheRaw = localStorage.getItem('mbd_image_cache') || '{}';
            const cache = JSON.parse(cacheRaw);
            if (cache[fileId]) {
              node.setAttribute('src', cache[fileId]);
            }
          } catch {}
        }
      }
    }

    // Ensure checkboxes in task list are disabled
    if (node.tagName === 'INPUT' && node.getAttribute('type') === 'checkbox') {
      node.setAttribute('disabled', 'true');
    }
  });
}

/**
 * Compress image client-side (~1600px max dimension, ~0.8 JPEG quality) and upload via Apps Script or local reference cache.
 */
export async function compressAndUploadImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1600;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64Data = dataUrl.split(',')[1];

        // Check sync config for Apps Script URL
        let scriptUrl = '';
        let token = '';
        try {
          const syncRaw = localStorage.getItem('mbd_sync_config');
          if (syncRaw) {
            const parsed = JSON.parse(syncRaw);
            scriptUrl = parsed.scriptUrl || '';
            token = parsed.token || '';
          }
        } catch {}

        if (scriptUrl) {
          try {
            const res = await fetch(scriptUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain' },
              body: JSON.stringify({
                action: 'uploadFile',
                token,
                filename: file.name || `image_${Date.now()}.jpg`,
                mimeType: 'image/jpeg',
                base64: base64Data
              })
            });
            const json = await res.json();
            if (json.success && json.data) {
              const fileId = json.data.fileId || json.data.id;
              const fileUrl = json.data.url || (fileId ? `https://drive.google.com/uc?export=view&id=${fileId}` : '');
              if (fileUrl) {
                try {
                  const cacheRaw = localStorage.getItem('mbd_image_cache') || '{}';
                  const cache = JSON.parse(cacheRaw);
                  if (fileId) cache[fileId] = dataUrl;
                  localStorage.setItem('mbd_image_cache', JSON.stringify(cache));
                } catch {}
                resolve(fileUrl);
                return;
              }
            }
          } catch (err) {
            console.warn('Apps Script upload failed, using local secure reference', err);
          }
        }

        const fileId = `drive_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        try {
          const cacheRaw = localStorage.getItem('mbd_image_cache') || '{}';
          const cache = JSON.parse(cacheRaw);
          cache[fileId] = dataUrl;
          localStorage.setItem('mbd_image_cache', JSON.stringify(cache));
        } catch {}

        resolve(`https://drive.google.com/uc?export=view&id=${fileId}`);
      };
      img.onerror = () => reject(new Error('Gagal memproses gambar'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar'));
    reader.readAsDataURL(file);
  });
}

/**
 * Automatically migrate any legacy base64 images in HTML to Drive references upon save.
 */
export async function migrateBase64InHtml(html: string): Promise<string> {
  if (!html || !html.includes('data:image/')) return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const imgs = doc.querySelectorAll('img');

  for (const img of imgs) {
    const src = img.getAttribute('src') || '';
    if (src.startsWith('data:image/')) {
      try {
        const res = await fetch(src);
        const blob = await res.blob();
        const file = new File([blob], `migrated_${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' });
        const newUrl = await compressAndUploadImage(file);
        img.setAttribute('src', newUrl);
      } catch (err) {
        throw new Error('Gagal mengunggah gambar base64 lama ke Drive');
      }
    }
  }

  return doc.body.innerHTML;
}

/**
 * Calculate statistics (words, characters, readMinutes) from HTML content string.
 */
export function calculateStats(htmlContent: string) {
  if (!htmlContent) {
    return { words: 0, characters: 0, readMinutes: 1 };
  }

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  const text = tempDiv.textContent || tempDiv.innerText || '';

  const characters = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const readMinutes = Math.max(1, Math.ceil(words / 200));

  return { words, characters, readMinutes };
}

/**
 * Convert legacy block-based page to HTML.
 */
export function convertBlocksToHtml(page: MaterialPage): string {
  if (page.contentHtml && page.schemaVersion === 2) {
    return page.contentHtml;
  }

  if (!page.blocks || page.blocks.length === 0) {
    return '<p>Materi pembelajaran...</p>';
  }

  let html = '';

  for (const block of page.blocks) {
    switch (block.type) {
      case 'text': {
        const textContent = block.content || '';
        const escapedText = textContent
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br />');

        html += `<p>${escapedText}</p>`;
        break;
      }
      case 'image': {
        if (block.imageSrc) {
          html += `<figure style="text-align: center; margin: 1.5em 0;"><img src="${block.imageSrc}" alt="Gambar Materi" style="max-width: 100%; height: auto; border-radius: 0.75rem; display: inline-block;" /><figcaption style="font-size: 0.875rem; color: #64748b; margin-top: 0.5rem;"></figcaption></figure>`;
        }
        break;
      }
      case 'video': {
        if (block.videoUrl) {
          let embedUrl = block.videoUrl;
          if (embedUrl.includes('watch?v=')) {
            embedUrl = embedUrl.replace('watch?v=', 'embed/');
          } else if (embedUrl.includes('youtu.be/')) {
            embedUrl = embedUrl.replace('youtu.be/', 'www.youtube.com/embed/');
          }
          html += `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 1.5em 0; border-radius: 0.75rem;"><iframe src="${embedUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen></iframe></div>`;
        }
        break;
      }
      case 'table': {
        if (block.tableData && block.tableData.length > 0) {
          html += '<div style="overflow-x: auto; margin: 1.5em 0;"><table style="width: 100%; border-collapse: collapse;"><tbody>';
          block.tableData.forEach((row, rIdx) => {
            html += '<tr>';
            row.forEach((cell) => {
              const tag = rIdx === 0 ? 'th' : 'td';
              html += `<${tag} style="border: 1px solid rgba(255,255,255,0.2); padding: 0.75rem; text-align: left;">${cell || ''}</${tag}>`;
            });
            html += '</tr>';
          });
          html += '</tbody></table></div>';
        }
        break;
      }
      case 'divider': {
        html += '<hr style="margin: 2rem 0; border-color: rgba(255,255,255,0.2);" />';
        break;
      }
      default:
        break;
    }
  }

  return html;
}
