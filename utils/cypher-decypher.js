import bcrypt from "bcryptjs";

var salt = bcrypt.genSaltSync(10);

export function Cypher(password) {
  return bcrypt.hashSync(password, salt);
}

export function Decypher(password, DBpassword) {
  return bcrypt.compareSync(password, DBpassword);
}