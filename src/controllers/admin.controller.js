const asyncHandler = require("../utils/asyncHandler");
const adminService = require("../services/admin.service");

const top10Doencas = asyncHandler(async (req, res) => {
  res.json(await adminService.top10Doencas());
});

const rankingMedicos = asyncHandler(async (req, res) => {
  res.json(await adminService.rankingMedicos());
});

const removerAdmin = asyncHandler(async (req, res) => {
  await adminService.removerAdmin(Number(req.params.id));
  res.status(200).send();
});

const adminUmaSemana = asyncHandler(async (req, res) => {
  await adminService.tornarAdminPorUmaSemana(Number(req.params.id));
  res.status(200).send();
});

const adminUmMes = asyncHandler(async (req, res) => {
  await adminService.tornarAdminPorUmMes(Number(req.params.id));
  res.status(200).send();
});

const adminPermanente = asyncHandler(async (req, res) => {
  await adminService.tornarAdminPermanente(Number(req.params.id));
  res.status(200).send();
});

module.exports = {
  top10Doencas,
  rankingMedicos,
  removerAdmin,
  adminUmaSemana,
  adminUmMes,
  adminPermanente,
};
