export default function dateFormatter(dateInt) {
  console.log(dateInt);
  let str = dateInt.toString();
  console.log("str : ", str);
  const year = str.slice(0, 4);
  const month = str.slice(4, 6);
  const day = str.slice(6, 8);
  const hour = str.slice(8, 10);
  const minute = str.slice(10, 12);

  return `${day}/${month}/${year} ${hour}:${minute}`;
}
