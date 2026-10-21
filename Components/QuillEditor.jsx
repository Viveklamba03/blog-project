"use client";

import { useEffect, useRef } from "react";
import "quill/dist/quill.snow.css";

const toolbarOptions = [
  [{ header: [2, 3, 4, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ align: [] }],
  ["blockquote", "link", "image"],
  ["clean"],
];

export default function QuillEditor({ initialContent, onChange }) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const initialContentRef = useRef(initialContent);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let active = true;
    let textChangeHandler;
    const editorContainer = containerRef.current;

    import("quill").then(({ default: Quill }) => {
      if (!active || !editorContainer) return;

      const editor = new Quill(editorContainer, {
        theme: "snow",
        placeholder: "Write your article. Use headings, lists, links and images to structure the story.",
        modules: {
          toolbar: {
            container: toolbarOptions,
            handlers: {
              image() {
                const imageUrl = window.prompt("Enter the public URL of the image to embed:");
                if (!imageUrl) return;

                let url;
                try {
                  url = new URL(imageUrl);
                } catch {
                  window.alert("Enter a valid public image URL.");
                  return;
                }

                if (!["https:", "http:"].includes(url.protocol)) {
                  window.alert("Image URLs must use HTTPS or HTTP.");
                  return;
                }

                const alt = window.prompt("Enter descriptive alt text for this image:", "") || "";
                const range = this.quill.getSelection(true);
                if (!range) return;
                this.quill.insertEmbed(range.index, "image", url.href, "user");
                this.quill.setSelection(range.index + 1, 0, "silent");
                const image = [...this.quill.root.querySelectorAll("img")].find(
                  (element) => element.getAttribute("src") === url.href
                );
                image?.setAttribute("alt", alt);
                onChangeRef.current(this.quill.root.innerHTML);
              },
            },
          },
        },
      });

      editorRef.current = editor;
      editor.root.setAttribute("aria-labelledby", "article-content-label");
      editor.root.setAttribute("aria-multiline", "true");
      editor.clipboard.dangerouslyPasteHTML(initialContentRef.current || "");

      textChangeHandler = () => {
        const html = editor.root.innerHTML;
        onChangeRef.current(html);
      };
      editor.on("text-change", textChangeHandler);
    });

    return () => {
      active = false;
      if (editorRef.current && textChangeHandler) {
        editorRef.current.off("text-change", textChangeHandler);
      }
      editorRef.current = null;
      if (editorContainer) editorContainer.innerHTML = "";
    };
  }, []);

  return (
    <div className="quill-editor mt-1.5 overflow-hidden rounded-lg border border-slate-300 focus-within:border-emerald-700">
      <div ref={containerRef} className="quill-editor-container" />
      <p className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
        Use the image button to embed an image hosted at a public HTTP(S) URL. Image file uploads require a configured storage provider.
      </p>
      <style jsx global>{`
        .quill-editor .ql-toolbar.ql-snow {
          border: 0;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }
        .quill-editor .ql-container.ql-snow {
          border: 0;
          min-height: 18rem;
          font-size: 1rem;
        }
        .quill-editor .ql-editor {
          min-height: 18rem;
          line-height: 1.7;
        }
        .quill-editor .ql-editor img {
          display: block;
          max-width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
}
