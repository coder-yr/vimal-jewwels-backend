const StringListView = (props) => {
  const { record, property } = props;
  const items = [];
  let index = 0;
  while (true) {
    var value = record.params[`texts.${index}`];
    if (value) {
      index++;
      items.push(value);
    } else {
      break;
    }
  }
  console.log(items);
  if (!Array.isArray(items) || items.length === 0) {
    return <span>{String(property.name)}</span>;
  }
  return <span>{items.join(", ")}</span>;
};

export default StringListView;
