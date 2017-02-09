import presetLatest from "babel-preset-latest";
import pluginTransformClassProperties from "babel-plugin-transform-class-properties";
import pluginTransformObjectRestSpread from "babel-plugin-transform-object-rest-spread";

export default {
  presets: [
    presetLatest
  ],
  plugins: [
    pluginTransformClassProperties,
    [pluginTransformObjectRestSpread, { useBuiltIns: true }]
  ]
};