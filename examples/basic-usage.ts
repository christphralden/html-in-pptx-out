import { HtmlToPptx } from '../src/index';
import { createCustomFontPlugin } from '../src/plugins';

const exampleHtml = `
<!DOCTYPE html>
<html>
<body>
  <div class="slide">
    <h1>First Slide</h1>
    <p>This is the first slide content</p>
  </div>

  <div class="slide">
    <h1>Second Slide</h1>
    <p>This is the second slide content</p>
    <ul>
      <li>Point 1</li>
      <li>Point 2</li>
      <li>Point 3</li>
    </ul>
  </div>

  <div class="slide">
    <h1>Third Slide</h1>
    <p>This is the final slide</p>
  </div>
</body>
</html>
`;

async function main() {
  const customFont = createCustomFontPlugin({
    fontFace: 'Arial',
    applyToAll: true,
  });

  const converter = new HtmlToPptx({
    slideSelector: '.slide',
    titleSelector: 'h1',
    contentSelector: 'p',
  });

  await converter
    .load(exampleHtml)
    .use(customFont)
    .convert()
    .then(() =>
      converter.export({
        format: 'pptx',
        filename: 'example-presentation.pptx',
      })
    );

  console.log('Presentation created successfully!');
}

main().catch(console.error);
