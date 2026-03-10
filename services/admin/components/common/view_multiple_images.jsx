import React from "react";
import { Box, Text } from "@adminjs/design-system";
import { serverUrlImage } from "../constants";

const toAbs = (value) => {
  if (!value || typeof value !== "string") return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/images/")) {
    return `${serverUrlImage}${value.replace(/^\/images\//, "")}`;
  }
  if (value.startsWith("images/")) {
    return `${serverUrlImage}${value.replace(/^images\//, "")}`;
  }
  return `${serverUrlImage}${value}`;
};

const resolveSources = (value) => {
  if (!value || typeof value !== "string") return [];
  if (/^https?:\/\//i.test(value)) return [value];

  const normalized = value.startsWith("/") ? value : `/${value}`;
  const cleaned = value.replace(/^\/?images\//, "");
  const absolute = toAbs(value);

  // Try absolute backend URL first to avoid 404s on admin host (:7503).
  const candidates = [];
  if (absolute) {
    candidates.push(absolute);
  }
  if (normalized.startsWith("/images/")) {
    candidates.push(normalized);
  }
  if (!normalized.startsWith("/images/") && cleaned) {
    candidates.push(`${serverUrlImage}${cleaned}`);
    candidates.push(`/images/${cleaned}`);
  }

  return [...new Set(candidates)];
};

const ImageWithFallback = ({ image, index }) => {
  const sources = resolveSources(image);
  const [srcIndex, setSrcIndex] = React.useState(0);

  if (!sources.length) return null;

  return (
    <img
      src={sources[srcIndex]}
      alt={`return-${index}`}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
      onError={() => {
        if (srcIndex < sources.length - 1) {
          setSrcIndex(srcIndex + 1);
        }
      }}
    />
  );
};

const extractImages = (record, propertyName) => {
  const raw = record?.params?.[propertyName];
  const flattenValue = (val) => {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object") {
      return val.src || val.url || val.path || "";
    }
    return "";
  };

  if (Array.isArray(raw)) return raw.map(flattenValue).filter(Boolean);

  // Handle objects keyed by numeric indices: {"0": "/images/a.png"}
  if (raw && typeof raw === "object") {
    const numericObjectValues = Object.keys(raw)
      .filter((k) => /^\d+$/.test(k))
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => flattenValue(raw[k]))
      .filter(Boolean);
    if (numericObjectValues.length) return numericObjectValues;
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(flattenValue).filter(Boolean);
      if (parsed && typeof parsed === "object") {
        const numericObjectValues = Object.keys(parsed)
          .filter((k) => /^\d+$/.test(k))
          .sort((a, b) => Number(a) - Number(b))
          .map((k) => flattenValue(parsed[k]))
          .filter(Boolean);
        if (numericObjectValues.length) return numericObjectValues;
      }
    } catch (e) {
      return [raw];
    }
  }

  // Handle flattened keys like images.0 and images.0.src from AdminJS.
  // Prefer direct values (images.0) over derived subfields (images.0.src).
  const flattened = [];
  const scoreForValue = (val) => {
    if (typeof val !== "string") return 0;
    if (val.startsWith("/images/") || val.startsWith("images/")) return 3;
    if (/^https?:\/\//i.test(val)) return 2;
    return 1;
  };

  const pickBetter = (current, incoming) => {
    if (!current) return incoming;
    return scoreForValue(incoming) > scoreForValue(current) ? incoming : current;
  };

  Object.keys(record?.params || {}).forEach((k) => {
    const m = k.match(new RegExp(`^${propertyName}\.(\d+)(?:\..+)?$`));
    if (!m) return;
    const idx = Number(m[1]);
    if (!Number.isFinite(idx)) return;
    const value = flattenValue(record.params[k]);
    flattened[idx] = pickBetter(flattened[idx], value);
  });

  const fromFlattened = flattened.filter(Boolean);
  if (fromFlattened.length) return fromFlattened;

  // Last-resort fallback for unexpected AdminJS payload shapes.
  try {
    const text = JSON.stringify(record?.params || {});
    const matches = text.match(/\/?images\/[A-Za-z0-9._-]+/g) || [];
    const normalized = matches
      .map((m) => (m.startsWith("/") ? m : `/${m}`))
      .filter(Boolean);
    return [...new Set(normalized)];
  } catch {
    return [];
  }
};

const ViewMultipleImages = (props) => {
  const { record, property } = props;
  const images = extractImages(record, property.name)
    .map((img) => (typeof img === "string" ? img : img?.src || img?.url || ""))
    .filter(Boolean);

  if (!images.length) return <Text color="grey60">No Images</Text>;

  return (
    <Box display="flex" flexWrap="wrap" gap="sm">
      {images.map((src, index) => (
        <Box
          key={`${src}-${index}`}
          width="84px"
          height="84px"
          style={{ border: "1px solid #e5e7eb", borderRadius: 6, overflow: "hidden" }}
        >
          <ImageWithFallback image={src} index={index} />
        </Box>
      ))}
    </Box>
  );
};

export default ViewMultipleImages;
