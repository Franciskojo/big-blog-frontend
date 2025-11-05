import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/pages.css';

const EditPost = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    published: false
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRemovingImage, setIsRemovingImage] = useState(false);

  const fileInputRef = useRef(null);
  const { makeRequest } = useApi();
  const { user } = useAuth();
  const navigate = useNavigate();

  // ✅ Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await makeRequest('get', `/posts/${id}`);

        if (!data.post) {
          throw new Error('Post not found');
        }

        // 🧠 Role-based access
        if (data.post.authorId !== user.id && user.role !== 'ADMIN') {
          navigate('/dashboard');
          return;
        }

        setFormData({
          title: data.post.title,
          content: data.post.content,
          excerpt: data.post.excerpt || '',
          tags: data.post.tags?.join(', ') || '',
          published: data.post.published
        });

        if (data.post.image) {
          // 👇 Adjust based on backend storage
          const imageUrl = data.post.image.startsWith('http')
            ? data.post.image
            : `http://localhost:5000${data.post.image}`;
          setCurrentImageUrl(imageUrl);
          setImagePreview(imageUrl);
        }
      } catch (err) {
        console.error('Failed to fetch post:', err);
        alert('Unable to load post details. Redirecting to dashboard.');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchPost();
  }, [id, user, navigate, makeRequest]);

  // ✅ Input change handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // ✅ Handle image change
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
      reader.onload = (event) => setImagePreview(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  // ✅ Cancel new image before upload
  const clearNewImage = () => {
    setImage(null);
    setImagePreview(currentImageUrl);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ✅ Remove current image (backend route: DELETE /posts/:id/image)
  const removeCurrentImage = async () => {
    if (!window.confirm('Remove current image?')) return;
    setIsRemovingImage(true);
    try {
      await makeRequest('delete', `/posts/${id}/image`);
      setCurrentImageUrl(null);
      setImagePreview(null);
      setImage(null);
    } catch (err) {
      console.error('Failed to remove image:', err);
      alert(`Failed to remove image: ${err.message}`);
    } finally {
      setIsRemovingImage(false);
    }
  };

  // ✅ Form validation
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Submit handler
  const handleSubmit = async (e, publishState = formData.published) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('excerpt', formData.excerpt);
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('published', JSON.stringify(publishState)); // ensure string

      if (image) formDataToSend.append('postsImage', image);

      await makeRequest('put', `/posts/${id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/dashboard');
    } catch (err) {
      console.error('Update failed:', err);
      setErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Delete post
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await makeRequest('delete', `/posts/${id}`);
      navigate('/dashboard');
    } catch (err) {
      console.error('Delete failed:', err);
      setErrors({ submit: err.message });
    }
  };

  if (isLoading) {
    return (
      <div className="container">
        <LoadingSpinner text="Loading post..." />
      </div>
    );
  }

  return (
    <div className="edit-post-page">
      <div className="container">
        <div className="page-header">
          <h1>Edit Post</h1>
          <button onClick={handleDelete} className="btn btn-danger" disabled={isSubmitting}>
            Delete Post
          </button>
        </div>

        <form onSubmit={handleSubmit} className="post-form">
          {errors.submit && <div className="alert alert-error">{errors.submit}</div>}

          {/* Title */}
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

          {/* ✅ Image Upload */}
          <div className="form-group">
            <label htmlFor="postsImage">Featured Image</label>

            <div className="image-upload-section">
              <input
                type="file"
                id="postsImage"
                name="postsImage"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: 'none' }}
              />

              {imagePreview ? (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" className="preview-image" />
                  <div className="image-actions">
                    {image ? (
                      <button type="button" onClick={clearNewImage} className="btn btn-outline btn-sm">
                        Cancel New Image
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={removeCurrentImage}
                        className="btn btn-danger btn-sm"
                        disabled={isRemovingImage}
                      >
                        {isRemovingImage ? 'Removing...' : 'Remove Image'}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <label htmlFor="postsImage" className="image-upload-placeholder">
                  <p>Click to upload a featured image</p>
                  <small>Supports: JPG, PNG, GIF • Max: 5MB</small>
                </label>
              )}
            </div>
          </div>

          {/* Excerpt */}
          <div className="form-group">
            <label htmlFor="excerpt">Excerpt</label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows="3"
              placeholder="Brief description of your post"
            />
          </div>

          {/* Content */}
          <div className="form-group">
            <label htmlFor="content">Content *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="15"
              className={errors.content ? 'input-error' : ''}
              placeholder="Write your post content here..."
            />
            {errors.content && <span className="error-message">{errors.content}</span>}
          </div>

          {/* Tags */}
          <div className="form-group">
            <label htmlFor="tags">Tags (Optional)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., technology, web-dev"
            />
          </div>

          {/* Publish toggle */}
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={handleChange}
              />
              Publish this post
            </label>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-outline"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <div className="action-buttons">
              <button
                type="submit"
                className="btn btn-outline"
                disabled={isSubmitting}
                onClick={(e) => handleSubmit(e, false)}
              >
                {isSubmitting ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                onClick={(e) => handleSubmit(e, true)}
              >
                {isSubmitting ? 'Publishing...' : 'Publish Post'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
