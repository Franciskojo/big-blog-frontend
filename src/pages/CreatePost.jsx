import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/pages.css';


const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    published: false,
    categoryId: '', 
  });

  const [categories, setCategories] = useState([]); 
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const { makeRequest } = useApi();
  const navigate = useNavigate();

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await makeRequest('get', '/categories');
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Handle text/checkbox/select inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // ✅ Handle image selection and preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, image: 'Please select an image file' }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: 'Image must be smaller than 5MB' }));
        return;
      }

      setImage(file);
      setErrors((prev) => ({ ...prev, image: '' }));

      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ✅ Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 10) {
      newErrors.content = 'Content must be at least 10 characters long';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('excerpt', formData.excerpt);
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('published', formData.published);
      formDataToSend.append('categoryId', formData.categoryId); // ✅ send categoryId

      if (image) {
        formDataToSend.append('postsImage', image);
      }

      await makeRequest('post', '/posts', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/dashboard');
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-post-page">
      <div className="container">
        <div className="page-header">
          <h1>Create New Post</h1>
        </div>

        <form onSubmit={handleSubmit} className="post-form">
          {errors.submit && <div className="alert alert-error">{errors.submit}</div>}

          {/* 📝 Title */}
          <div className="form-group">
            <label htmlFor="title">Post Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'input-error' : ''}
              placeholder="Enter post title"
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          {/* 🗂️ Category Selector */}
          <div className="form-group">
            <label htmlFor="categoryId">Category *</label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className={errors.categoryId ? 'input-error' : ''}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <span className="error-message">{errors.categoryId}</span>
            )}
          </div>

          {/* 🖼️ Image Upload */}
          <div className="form-group">
            <label htmlFor="postsImage">Featured Image (Optional)</label>

            <div className="image-upload-section">
              <input
                type="file"
                id="postsImage"
                name="postsImage"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="image-input"
                style={{ display: 'none' }}
              />

              {imagePreview ? (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" className="preview-image" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="remove-image-btn"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <label htmlFor="postsImage" className="image-upload-placeholder">
                  <div className="upload-icon"></div>
                  <p>Click to upload a featured image</p>
                  <small>Supports: JPG, PNG, GIF • Max: 5MB</small>
                </label>
              )}

              {errors.image && <span className="error-message">{errors.image}</span>}
            </div>
          </div>

          {/* ✍️ Excerpt */}
          <div className="form-group">
            <label htmlFor="excerpt">Excerpt (Optional)</label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows="3"
              placeholder="Brief description of your post"
            />
          </div>

          {/* 🧾 Content */}
          <div className="form-group">
            <label htmlFor="content">Content *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="12"
              className={errors.content ? 'input-error' : ''}
              placeholder="Write your post content here..."
            />
            {errors.content && <span className="error-message">{errors.content}</span>}
          </div>

          {/* 🏷️ Tags */}
          <div className="form-group">
            <label htmlFor="tags">Tags (Optional)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Enter tags separated by commas (e.g., technology, web-development)"
            />
            <small>Separate multiple tags with commas</small>
          </div>

          {/* 🔘 Publish toggle */}
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={handleChange}
              />
              Publish immediately
            </label>
          </div>

          {/* 🚀 Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <LoadingSpinner size="small" text="" /> : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
