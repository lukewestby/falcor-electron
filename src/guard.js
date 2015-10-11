export default function guard(pairs) {
  return pairs.reverse().reduce((result, [predicate, value]) => {
    return predicate ? value : result;
  }, null);
}
