type Item = {
  id: string | number;
  item?: Record<string, any>;
  [key: string]: any;
};

export function updateGroupItemById(
  groups: Item[][],
  id: string | number,
  key: string,
  value: any,
  updateInsideItem: boolean = false,
): Item[][] {
  return groups.map(group =>
    group.map(entry => {
      if (entry.id !== id) return entry;

      if (updateInsideItem && entry.item && typeof entry.item === 'object') {
        return {
          ...entry,
          item: {
            ...entry.item,
            [key]: value,
          },
        };
      }

      return {
        ...entry,
        [key]: value,
      };
    }),
  );
}
