function isValidCpf(cpfRaw) {
  if (!cpfRaw) return false;

  const cpf = String(cpfRaw).replace(/\D/g, "");

  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false; // todos os dígitos iguais

  const calcDigit = (base) => {
    let sum = 0;
    let weight = base.length + 1;
    for (const digit of base) {
      sum += Number(digit) * weight;
      weight -= 1;
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  const digit1 = calcDigit(cpf.slice(0, 9));
  const digit2 = calcDigit(cpf.slice(0, 9) + digit1);

  return cpf === cpf.slice(0, 9) + String(digit1) + String(digit2);
}

module.exports = { isValidCpf };
