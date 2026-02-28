import { ComponentLoader } from "adminjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loader = new ComponentLoader();
const components = {
  DashboardComponent: loader.add(
    "DashboardComponent",
    path.join(__dirname, "components/dashboard/dashboard.jsx"),
  ),
  UploadSingleImage: loader.add(
    "UploadSingleImage",
    path.join(__dirname, "components/common/single_image_upload.jsx"),
  ),
  ViewSingleImage: loader.add(
    "ViewSingleImage",
    path.join(__dirname, "components/common/view_single_image.jsx"),
  ),
  CreateStringList: loader.add(
    "CreateStringList",
    path.join(__dirname, "components/common/string_list.jsx"),
  ),
  ViewStringList: loader.add(
    "ViewStringList",
    path.join(__dirname, "components/common/string_list_view.jsx"),
  ),
  DescriptionRichText: loader.add(
    "DescriptionRichText",
    path.join(__dirname, "components/product/description_rich.jsx"),
  ),
  KeyValueList: loader.add(
    "KeyValueList",
    path.join(__dirname, "components/product/key_value.jsx"),
  ),
  KeyValueView: loader.add(
    "KeyValueView",
    path.join(__dirname, "components/product/key_value_view.jsx"),
  ),
  UploadMultipleImage: loader.add(
    "UploadMultipleImage",
    path.join(__dirname, "components/common/multiple_image_upload.jsx"),
  ),
  SizeColorStock: loader.add(
    "SizeColorStock",
    path.join(__dirname, "components/product/size_color_stock.jsx"),
  ),
  SizeChart: loader.add(
    "SizeChart",
    path.join(__dirname, "components/product/size_chart.jsx"),
  ),
  MaterialsShow: loader.add(
    "MaterialsShow",
    path.join(__dirname, "components/product/materials_show.jsx"),
  ),
  MegaMenuShow: loader.add(
    "MegaMenuShow",
    path.join(__dirname, "components/mega_menu/mega_menu_show.jsx"),
  ),
  UploadVideo: loader.add(
    "UploadVideo",
    path.join(__dirname, "components/common/upload_video.jsx"),
  ),
  PriceBreakupList: loader.add(
    "PriceBreakupList",
    path.join(__dirname, "components/product/price_breakup_list.jsx"),
  ),
  VariantList: loader.add(
    "VariantList",
    path.join(__dirname, "components/product/variant_list.jsx"),
  ),
  OrderItems: loader.add(
    "OrderItems",
    path.join(__dirname, "components/order/order_items.jsx"),
  ),
  OrderAddress: loader.add(
    "OrderAddress",
    path.join(__dirname, "components/order/order_address.jsx"),
  ),
  UserOrders: loader.add(
    "UserOrders",
    path.join(__dirname, "components/user/user_orders.jsx"),
  ),
  LinksEditor: loader.add(
    "LinksEditor",
    path.join(__dirname, "components/footer/links_editor.jsx"),
  ),
  LinksShow: loader.add(
    "LinksShow",
    path.join(__dirname, "components/footer/links_show.jsx"),
  ),
};

export { loader, components };
