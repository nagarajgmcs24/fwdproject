import { useState, useEffect } from 'react';
import { Camera, Send, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface Category {
  id: string;
  category_key: string;
  name_en: string;
  name_hi: string;
  name_kn: string;
}

interface ComplaintFormProps {
  wardId: string;
  onSuccess: () => void;
}

export function ComplaintForm({ wardId, onSuccess }: ComplaintFormProps) {
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    categoryId: '',
    citizenName: '',
    citizenPhone: '',
    citizenEmail: '',
    locationDetails: '',
    problemDescription: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const { data } = await supabase
      .from('problem_categories')
      .select('*')
      .order('category_key');

    if (data) {
      setCategories(data);
    }
  }

  const getCategoryName = (category: Category) => {
    if (language === 'hi') return category.name_hi;
    if (language === 'kn') return category.name_kn;
    return category.name_en;
  };

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.categoryId || !formData.citizenName || !formData.citizenPhone ||
        !formData.locationDetails || !formData.problemDescription || !imageFile) {
      setError(t.requiredField);
      return;
    }

    setSubmitting(true);

    try {
      const fileName = `${Date.now()}-${imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('complaint-images')
        .upload(fileName, imageFile);

      if (uploadError) {
        const imageUrl = imagePreview;

        const { data: complaint, error: insertError } = await supabase
          .from('complaints')
          .insert({
            ward_id: wardId,
            category_id: formData.categoryId,
            citizen_name: formData.citizenName,
            citizen_phone: formData.citizenPhone,
            citizen_email: formData.citizenEmail || null,
            location_details: formData.locationDetails,
            problem_description: formData.problemDescription,
            image_url: imageUrl,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        await performBasicVerification(complaint.id, formData.problemDescription);
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('complaint-images')
          .getPublicUrl(fileName);

        const { data: complaint, error: insertError } = await supabase
          .from('complaints')
          .insert({
            ward_id: wardId,
            category_id: formData.categoryId,
            citizen_name: formData.citizenName,
            citizen_phone: formData.citizenPhone,
            citizen_email: formData.citizenEmail || null,
            location_details: formData.locationDetails,
            problem_description: formData.problemDescription,
            image_url: publicUrl,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        await performBasicVerification(complaint.id, formData.problemDescription);
      }

      setSuccess(true);
      setFormData({
        categoryId: '',
        citizenName: '',
        citizenPhone: '',
        citizenEmail: '',
        locationDetails: '',
        problemDescription: '',
      });
      setImageFile(null);
      setImagePreview('');

      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (err) {
      console.error('Error submitting complaint:', err);
      setError(t.errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  async function performBasicVerification(complaintId: string, description: string) {
    const spamKeywords = ['test', 'testing', 'spam', 'fake', 'abuse'];
    const lowerDesc = description.toLowerCase();
    const isSuspicious = spamKeywords.some(keyword => lowerDesc.includes(keyword));

    let verificationStatus = 'legitimate';
    let verificationNotes = 'Complaint appears legitimate based on content analysis.';

    if (isSuspicious) {
      verificationStatus = 'suspicious';
      verificationNotes = 'Complaint flagged for review - contains suspicious keywords.';
    }

    if (description.length < 10) {
      verificationStatus = 'suspicious';
      verificationNotes = 'Complaint description is too short. Requires manual review.';
    }

    await supabase
      .from('complaints')
      .update({
        verification_status: verificationStatus,
        verification_notes: verificationNotes,
      })
      .eq('id', complaintId);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {t.successMessage}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.problemType} *
        </label>
        <select
          value={formData.categoryId}
          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">{t.problemType}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {getCategoryName(cat)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.yourName} *
        </label>
        <input
          type="text"
          value={formData.citizenName}
          onChange={(e) => setFormData({ ...formData, citizenName: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.phoneNumber} *
        </label>
        <input
          type="tel"
          value={formData.citizenPhone}
          onChange={(e) => setFormData({ ...formData, citizenPhone: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="+91-XXXXXXXXXX"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.email}
        </label>
        <input
          type="email"
          value={formData.citizenEmail}
          onChange={(e) => setFormData({ ...formData, citizenEmail: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.location} *
        </label>
        <input
          type="text"
          value={formData.locationDetails}
          onChange={(e) => setFormData({ ...formData, locationDetails: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.description} *
        </label>
        <textarea
          value={formData.problemDescription}
          onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.uploadPhoto} *
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {imagePreview ? (
            <div className="space-y-2">
              <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview('');
                }}
                className="text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="cursor-pointer">
              <Camera className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <span className="text-gray-600">{t.uploadPhoto}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                required
              />
            </label>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
      >
        <Send className="w-5 h-5" />
        {submitting ? t.submitting : t.submit}
      </button>
    </form>
  );
}
