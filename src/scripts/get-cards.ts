import { JSDOM } from "jsdom";
import fs from "fs";

const scrape = async () => {
  const resposne = await fetch("https://www.unicornsdatabase.com/packs/base");

  const data = await resposne.text();

  const domz = new JSDOM(data);

  const images = [];

  domz.window.document
    .querySelectorAll("a.column.is-6-mobile.is-4-tablet.is-3-desktop")
    .forEach((el) => {
      const href = el.getAttribute("href");
      const link = href.lastIndexOf("/") + 1;

      images.push({
        id: href.slice(link),
        image: el.querySelector("img").getAttribute("src"),
      });
    });

  fs.writeFileSync("./basic-cards.json", JSON.stringify(images));

  console.log(images);

  return images;
};

scrape();
