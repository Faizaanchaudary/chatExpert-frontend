import { FlatList, Modal, TouchableWithoutFeedback, View } from "react-native";
import React from "react";
import { styles } from "./style";
import FilterCard from "../FilterCard";
import { img } from "../../assets/img";

interface FilterModalProps {
  visible?: any;
  setShowFilterModal?: any;
  onSelectFilter?: (filter: string) => void; // Prop to pass the selected filter
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  setShowFilterModal,
  onSelectFilter,
}) => {
  const filters = [
    {
      name: "sepia",
      source: img.filter1,
    },
    {
      name: "brightness",
      source: img.filter2,
    },
    {
      name: "contrast",
      source: img.filter3,
    },
  ];

  const handleFilterSelect = (filter: any) => {
    if (onSelectFilter) onSelectFilter(filter.name); // Pass the selected filter to the parent component
    setShowFilterModal(false);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowFilterModal(false)}>
        <View />
      </TouchableWithoutFeedback>

      <View>
        <FlatList
          data={filters}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <FilterCard
              filter={item}
              onPress={() => handleFilterSelect(item)}
            />
          )}
        />
      </View>
    </Modal>
  );
};

export default FilterModal;
