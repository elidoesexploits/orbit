const input = document.querySelector('.galaxy-input');
const searchBTN = document.querySelector('.search-btn');


document.addEventListener('contextmenu', event => event.preventDefault());


searchBTN.addEventListener("click", async (event) => {
  event.preventDefault();
  window.navigator.serviceWorker
    .register("./sw.js", {
      scope: __uv$config.prefix,
    })
    .then(() => {
      let url = input.value.trim();
      if (!isUrl(url)) url = "https://www.google.com/search?q=" + url;
      else if (!(url.startsWith("https://") || url.startsWith("http://")))
        url = "http://" + url;
      sessionStorage.setItem("encodedUrl", __uv$config.encodeUrl(url));
      location.href = "web";
    });
});

function isUrl(val = "") {
  if (
    /^http(s?):\/\//.test(val) ||
    (val.includes(".") && val.substr(0, 1) !== " ")
  )
    return true;
  return false;
}
