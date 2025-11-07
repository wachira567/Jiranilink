import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import ItemCard from "../components/ItemCard";
import SearchBar from "../components/SearchBar";
import BorrowRequestModal from "../components/BorrowRequestModal";
import { subscribeToItems } from "../services/itemService";
import { createBorrowRequest } from "../services/borrowService";

const Catalog = () => {
  const { userId, user, isLoaded } = useAuth();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 6;

  // Load all items with real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToItems((fetchedItems) => {
      setItems(fetchedItems);
      setFilteredItems(fetchedItems);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategory === "All" || item.category === selectedCategory)
    );
    setFilteredItems(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, items]);

  const handleBorrowClick = (item) => {
    if (!userId) {
      toast.error("Please sign in to borrow items");
      return;
    }
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleBorrowSubmit = async (requestData) => {
    if (!userId) {
      toast.error("Please sign in to borrow items");
      return;
    }

    try {
      const borrowRequest = {
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        ownerId: selectedItem.ownerId,
        ownerName: selectedItem.ownerName,
        borrowerId: userId,
        borrowerName: user?.fullName || user?.firstName || "User",
        startDate: requestData.startDate,
        endDate: requestData.endDate,
      };

      await createBorrowRequest(borrowRequest);
      toast.success(
        "Borrow request sent successfully! The owner will respond soon."
      );
      setShowModal(false);
    } catch (error) {
      console.error("Error creating borrow request:", error);
      toast.error("Failed to send borrow request. Please try again.");
    }
  };

  const getOwner = (item) => {
    return {
      name: item.ownerName || "Owner",
      id: item.ownerId,
    };
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (!isLoaded || isLoading) return <div className="loading">Loading...</div>;

  return (
    <div className="catalog-page page-content">
      <div className="page-header">
        <h1>Item Catalog</h1>
        <p>Browse and borrow items from your community</p>
      </div>

      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <p>No items found matching your search.</p>
          <p>Try adjusting your filters or check back later!</p>
        </div>
      ) : (
        <>
          <div className="items-grid">
            {currentItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                owner={getOwner(item)}
                onBorrow={handleBorrowClick}
                isOwnItem={item.ownerId === userId}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn-secondary"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="btn-secondary"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {showModal && selectedItem && (
        <BorrowRequestModal
          item={selectedItem}
          owner={getOwner(selectedItem)}
          onClose={() => setShowModal(false)}
          onSubmit={handleBorrowSubmit}
        />
      )}
    </div>
  );
};

export default Catalog;
