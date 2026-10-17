export function isHostPassphrase(passphrase: string): boolean {
  const expected = process.env.HOST_PASSPHRASE;
  return expected !== undefined && expected !== "" && passphrase === expected;
}
