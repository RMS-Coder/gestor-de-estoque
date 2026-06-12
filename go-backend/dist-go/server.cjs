var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_promises = __toESM(require("fs/promises"), 1);
var import_path = __toESM(require("path"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_vite = require("vite");
var app = (0, import_express.default)();
var PORT = 3e3;
var DATA_FILE = import_path.default.join(process.cwd(), "data.json");
app.use(import_express.default.json());
async function readData() {
  try {
    const data = await import_promises.default.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}
async function writeData(data) {
  await import_promises.default.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}
app.get("/api/items", async (req, res) => {
  const items = await readData();
  res.json(items);
});
app.post("/api/items", async (req, res) => {
  const items = await readData();
  const newItem = {
    id: import_crypto.default.randomUUID(),
    nome: req.body.nome || "Novo Item",
    quantidade: typeof req.body.quantidade === "number" ? req.body.quantidade : 0
  };
  items.push(newItem);
  await writeData(items);
  res.json(newItem);
});
app.put("/api/items/:id", async (req, res) => {
  const items = await readData();
  const index = items.findIndex((item) => item.id === req.params.id);
  if (index !== -1) {
    items[index] = { ...items[index], ...req.body };
    await writeData(items);
    res.json(items[index]);
  } else {
    res.status(404).json({ error: "Item not found" });
  }
});
app.delete("/api/items/:id", async (req, res) => {
  let items = await readData();
  items = items.filter((item) => item.id !== req.params.id);
  await writeData(items);
  res.json({ success: true });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
