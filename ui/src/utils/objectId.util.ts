const ids = new WeakMap<object, string>();
let nextId = 0;

export function getObjectId(obj: object): string {
  let id = ids.get(obj);
  if (!id) {
    id = `obj-${nextId++}`;
    ids.set(obj, id);
  }
  return id;
}
