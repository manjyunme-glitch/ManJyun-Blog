import { describe, expect, it } from "vitest";
import { parseAttrs, parseContentBlocks } from "@/lib/content/cards";

describe("content cards", () => {
  it("parses shortcode attributes", () => {
    expect(parseAttrs(' src="/media/a.jpg" alt="NAS rack" caption="done"')).toEqual({
      src: "/media/a.jpg",
      alt: "NAS rack",
      caption: "done"
    });
  });

  it("splits markdown and rich cards", () => {
    const blocks = parseContentBlocks(`# Title

正文

{{< image src="/media/a.jpg" alt="a" >}}

{{< gallery caption="rack" >}}
/media/a.jpg|A
/media/b.jpg|B
{{< /gallery >}}

{{< audio src="/media/a.mp3" title="music" >}}
`);

    expect(blocks.map((block) => block.type)).toEqual(["markdown", "image", "gallery", "audio"]);
    expect(blocks[2]).toMatchObject({
      type: "gallery",
      items: [
        { src: "/media/a.jpg", caption: "A" },
        { src: "/media/b.jpg", caption: "B" }
      ]
    });
  });
});

