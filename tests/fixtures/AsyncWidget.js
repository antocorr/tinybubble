export default {
  name: "AsyncWidget",
  props: ["label"],
  template() {
    return `<div id="async-widget">{{ label || 'Async widget ready' }}</div>`;
  },
};
