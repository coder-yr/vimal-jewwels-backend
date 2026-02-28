const KeyValueView = (props) => {
  const { record, property } = props;

  // Try AdminJS flattened params for arrays of objects
  const items = [];
  let index = 0;
  while (true) {
    const key = record?.params?.[`${property.name}.${index}.key`];
    const value = record?.params?.[`${property.name}.${index}.value`];
    if (key !== undefined || value !== undefined) {
      items.push({ key, value });
      index++;
    } else {
      break;
    }
  }

  // Fallback: read raw JSON if present
  let raw = record?.params?.[property.name];
  if ((!items || items.length === 0) && raw) {
    try {
      const parsed = Array.isArray(raw) ? raw : typeof raw === 'string' ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        parsed.forEach((it) => {
          if (it && (it.key !== undefined || it.value !== undefined)) {
            items.push({ key: it.key, value: it.value });
          }
        });
      }
    } catch (e) {
      // ignore
    }
  }

  if (!items || items.length === 0) {
    return <span />;
  }

  return (
    <div>
      {items.map((it, i) => (
        <div key={i}>
          <strong>{String(it.key)}</strong>{": "}{String(it.value)}
        </div>
      ))}
    </div>
  );
};

export default KeyValueView;
