import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const CategoriesWidget = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/categories`);
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="widget categories-widget">
      <h3>Categories</h3>
      <ul className="categories-list">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link to={`/category/${category.slug}`} className="category-link">
              <span className="category-name">{category.name}</span>
              <span className="category-count">
                ({category._count?.posts || 0})
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoriesWidget;
