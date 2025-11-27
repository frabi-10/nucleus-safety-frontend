import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Upload, CheckCircle, X, Lightbulb } from 'lucide-react';
import { useCreateReport } from '@hooks/useReports';
import { Button, Input, Textarea, Select } from '@components/ui';
import {
  KAIZEN_CATEGORIES,
  KAIZEN_EXPECTED_BENEFITS,
  KAIZEN_IMPLEMENTATION_COST,
  PRIORITY_LEVELS,
} from '@utils/constants';
import { compressImage } from '@utils/helpers';
import { kaizenSchema } from './validationSchema';

export const SubmitKaizenPage = ({ toast }) => {
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { mutate: createReport, isPending } = useCreateReport();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(kaizenSchema),
    defaultValues: {
      category: '',
      current_state: '',
      proposed_improvement: '',
      expected_benefits: [],
      implementation_cost: 'Free',
      collaborators: '',
      department: '',
      priority: 'Medium',
      photos: [],
      submitted_by: '',
      submitted_by_email: '',
    },
  });

  const selectedBenefits = watch('expected_benefits') || [];

  const handlePhotoCapture = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentPhotos = watch('photos') || [];
    if (currentPhotos.length + files.length > 5) {
      toast.error('Maximum 5 photos allowed');
      return;
    }

    try {
      const compressedPhotos = await Promise.all(files.map((file) => compressImage(file)));
      const newPhotos = [...currentPhotos, ...compressedPhotos];
      setPhotoPreviews(newPhotos);
      setValue('photos', newPhotos);
      toast.success(`${files.length} photo(s) uploaded successfully`);
    } catch (error) {
      console.error('Error processing photos:', error);
      toast.error('Failed to process photos. Please try again.');
    }
  };

  const removePhoto = (index) => {
    const currentPhotos = watch('photos') || [];
    const newPhotos = currentPhotos.filter((_, i) => i !== index);
    setPhotoPreviews(newPhotos);
    setValue('photos', newPhotos);
    toast.success('Photo removed');
  };

  const toggleBenefit = (benefitValue) => {
    const current = selectedBenefits;
    const updated = current.includes(benefitValue)
      ? current.filter((b) => b !== benefitValue)
      : [...current, benefitValue];
    setValue('expected_benefits', updated);
  };

  const onSubmit = async (data) => {
    // Add form_type to distinguish Kaizen reports
    const kaizenData = {
      ...data,
      form_type: 'KAIZEN',
      type: 'Process Improvement',
      location: data.department || 'Company-Wide', // Use department as location, fallback to Company-Wide
      description: `Category: ${data.category}\n\nCurrent State:\n${data.current_state}\n\nProposed Improvement:\n${data.proposed_improvement}\n\nExpected Benefits: ${data.expected_benefits.join(', ')}\n\nEstimated Cost: ${data.implementation_cost}${data.collaborators ? `\n\nCollaborators: ${data.collaborators}` : ''}`,
      observer_name: data.submitted_by,
      observer_email: data.submitted_by_email,
      // Kaizen-specific status workflow
      status: 'Open', // Can be changed to 'Proposed' in backend
    };

    createReport(kaizenData, {
      onSuccess: () => {
        setSubmitSuccess(true);
        toast.success('Process improvement idea submitted successfully!');
        reset();
        setPhotoPreviews([]);

        setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);
      },
      onError: (error) => {
        console.error('Error submitting Kaizen:', error);
        toast.error('Failed to submit idea. Please try again.');
      },
    });
  };

  // Success screen
  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center border-2 border-yellow-500">
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 text-yellow-600 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Idea Submitted!</h2>
          <p className="text-lg text-gray-600 mb-6">
            Thank you for contributing to continuous improvement! Your idea will be reviewed by
            the team.
          </p>
          <Button onClick={() => setSubmitSuccess(false)}>Submit Another Idea</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-yellow-500">
        <div className="flex items-center gap-3 mb-6">
          <Lightbulb className="w-8 h-8 text-yellow-600" />
          <h2 className="text-3xl font-bold text-gray-900">Process Improvement (Kaizen)</h2>
        </div>

        <p className="text-gray-600 mb-6">
          Share your ideas for improving processes, batch records, equipment, or any aspect of our
          operations. Every improvement counts!
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Category */}
          <Select
            label="Category *"
            {...register('category')}
            options={KAIZEN_CATEGORIES}
            error={errors.category?.message}
          />

          {/* Current State */}
          <Textarea
            label="Current State / Problem *"
            {...register('current_state')}
            placeholder="Describe what is currently happening or what the problem is..."
            rows={4}
            error={errors.current_state?.message}
          />

          {/* Proposed Improvement */}
          <Textarea
            label="Proposed Improvement *"
            {...register('proposed_improvement')}
            placeholder="Describe your idea for improvement and how it would work..."
            rows={4}
            error={errors.proposed_improvement?.message}
          />

          {/* Expected Benefits */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Expected Benefits * (select all that apply)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {KAIZEN_EXPECTED_BENEFITS.map((benefit) => (
                <label
                  key={benefit.value}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-yellow-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedBenefits.includes(benefit.value)}
                    onChange={() => toggleBenefit(benefit.value)}
                    className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
                  />
                  <span className="text-gray-700">{benefit.label}</span>
                </label>
              ))}
            </div>
            {errors.expected_benefits && (
              <p className="text-sm text-red-600 mt-2">{errors.expected_benefits.message}</p>
            )}
          </div>

          {/* Implementation Cost */}
          <Select
            label="Estimated Implementation Cost *"
            {...register('implementation_cost')}
            options={KAIZEN_IMPLEMENTATION_COST}
            error={errors.implementation_cost?.message}
          />

          {/* Collaborators */}
          <Input
            label="Collaborators (optional)"
            {...register('collaborators')}
            placeholder="Names of people who helped develop this idea"
            error={errors.collaborators?.message}
          />

          {/* Department */}
          <Input
            label="Department (optional)"
            {...register('department')}
            placeholder="Which department would this affect?"
            error={errors.department?.message}
          />

          {/* Priority */}
          <Select
            label="Priority (optional)"
            {...register('priority')}
            options={PRIORITY_LEVELS}
            error={errors.priority?.message}
          />

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos (optional, up to 5 - before/after, diagrams, etc.)
            </label>

            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {photoPreviews.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                      Photo {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {photoPreviews.length < 5 && (
              <div className="flex gap-4">
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={handlePhotoCapture}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 cursor-pointer transition-colors">
                    <Camera className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">Take Photo</span>
                  </div>
                </label>

                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoCapture}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 cursor-pointer transition-colors">
                    <Upload className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">Upload Photos</span>
                  </div>
                </label>
              </div>
            )}
            {photoPreviews.length >= 5 && (
              <p className="text-sm text-yellow-600 mt-2">Maximum of 5 photos reached</p>
            )}
          </div>

          {/* Submitter Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your Information (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Your Name"
                {...register('submitted_by')}
                placeholder="Optional"
                error={errors.submitted_by?.message}
              />

              <Input
                label="Your Email"
                type="email"
                {...register('submitted_by_email')}
                placeholder="Optional"
                error={errors.submitted_by_email?.message}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                reset();
                setPhotoPreviews([]);
              }}
            >
              Clear Form
            </Button>
            <Button type="submit" loading={isPending} disabled={isPending}>
              {isPending ? 'Submitting...' : 'Submit Idea'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
