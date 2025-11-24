import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Upload, CheckCircle, X, Shield } from 'lucide-react';
import { useCreateReport } from '@hooks/useReports';
import { Button, Input, Textarea, Select } from '@components/ui';
import {
  LOCATIONS,
  PRIORITY_LEVELS,
  JHA_HAZARD_TYPES,
  JHA_CONTROL_MEASURES,
  JHA_RISK_LEVELS,
} from '@utils/constants';
import { compressImage } from '@utils/helpers';
import { jhaSchema } from './validationSchema';

export const SubmitJHAPage = ({ toast }) => {
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [availableAreas, setAvailableAreas] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);

  const { mutate: createReport, isPending } = useCreateReport();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(jhaSchema),
    defaultValues: {
      job_task: '',
      location: '',
      sub_location: '',
      specific_room: '',
      hazards_identified: [],
      risk_level: 'Medium',
      control_measures: [],
      ppe_required: '',
      additional_controls: '',
      task_steps: '',
      priority: 'Medium',
      photos: [],
      prepared_by: '',
      prepared_by_email: '',
      reviewed_by: '',
    },
  });

  const selectedLocation = watch('location');
  const selectedArea = watch('sub_location');
  const selectedHazards = watch('hazards_identified') || [];
  const selectedControls = watch('control_measures') || [];

  // Update available areas when location changes
  useEffect(() => {
    if (selectedLocation && LOCATIONS[selectedLocation]) {
      const areas = Object.keys(LOCATIONS[selectedLocation]);
      setAvailableAreas(areas);
      setValue('sub_location', '');
      setValue('specific_room', '');
      setAvailableRooms([]);
    } else {
      setAvailableAreas([]);
      setAvailableRooms([]);
    }
  }, [selectedLocation, setValue]);

  // Update available rooms when area changes
  useEffect(() => {
    if (selectedLocation && selectedArea && LOCATIONS[selectedLocation]?.[selectedArea]) {
      const rooms = LOCATIONS[selectedLocation][selectedArea];
      setAvailableRooms(rooms);

      if (rooms.length === 0) {
        setValue('specific_room', selectedArea);
      } else {
        setValue('specific_room', '');
      }
    } else {
      setAvailableRooms([]);
    }
  }, [selectedLocation, selectedArea, setValue]);

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

  const toggleHazard = (hazardValue) => {
    const current = selectedHazards;
    const updated = current.includes(hazardValue)
      ? current.filter((h) => h !== hazardValue)
      : [...current, hazardValue];
    setValue('hazards_identified', updated);
  };

  const toggleControl = (controlValue) => {
    const current = selectedControls;
    const updated = current.includes(controlValue)
      ? current.filter((c) => c !== controlValue)
      : [...current, controlValue];
    setValue('control_measures', updated);
  };

  const onSubmit = async (data) => {
    // Add form_type to distinguish JHA reports
    const jhaData = {
      ...data,
      form_type: 'JHA',
      type: 'Job Hazard Analysis', // For backward compatibility
      description: `Job/Task: ${data.job_task}\n\nTask Steps:\n${data.task_steps}\n\nHazards: ${data.hazards_identified.join(', ')}\n\nControls: ${data.control_measures.join(', ')}`,
      observer_name: data.prepared_by,
      observer_email: data.prepared_by_email,
    };

    createReport(jhaData, {
      onSuccess: () => {
        setSubmitSuccess(true);
        toast.success('JHA submitted successfully!');
        reset();
        setPhotoPreviews([]);

        setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);
      },
      onError: (error) => {
        console.error('Error submitting JHA:', error);
        toast.error('Failed to submit JHA. Please try again.');
      },
    });
  };

  // Success screen
  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center border-2 border-blue-500">
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 text-blue-600 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">JHA Submitted!</h2>
          <p className="text-lg text-gray-600 mb-6">
            Your Job Hazard Analysis has been submitted and will be reviewed by the safety team.
          </p>
          <Button onClick={() => setSubmitSuccess(false)}>Submit Another JHA</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-600">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-900">Job Hazard Analysis (JHA)</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Job/Task Information */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job/Task Information</h3>

            <Input
              label="Job/Task Name *"
              {...register('job_task')}
              placeholder="e.g., Chemical Transfer, Equipment Maintenance"
              error={errors.job_task?.message}
            />

            {/* Location Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Select
                label="Building *"
                {...register('location')}
                options={[
                  { value: '', label: 'Select Building' },
                  ...Object.keys(LOCATIONS).map((loc) => ({ value: loc, label: loc })),
                ]}
                error={errors.location?.message}
              />

              <Select
                label="Area *"
                {...register('sub_location')}
                options={[
                  { value: '', label: 'Select Area' },
                  ...availableAreas.map((area) => ({ value: area, label: area })),
                ]}
                error={errors.sub_location?.message}
                disabled={!selectedLocation}
              />

              {availableRooms.length > 0 ? (
                <Select
                  label="Specific Location *"
                  {...register('specific_room')}
                  options={[
                    { value: '', label: 'Select Location' },
                    ...availableRooms.map((room) => ({ value: room, label: room })),
                  ]}
                  error={errors.specific_room?.message}
                  disabled={!selectedArea}
                />
              ) : (
                <Input
                  label="Specific Location *"
                  {...register('specific_room')}
                  disabled={true}
                  className="bg-gray-100"
                />
              )}
            </div>

            {/* Task Steps */}
            <Textarea
              label="Task Steps/Procedure *"
              {...register('task_steps')}
              placeholder="Describe step-by-step how this task is performed..."
              rows={5}
              error={errors.task_steps?.message}
              className="mt-4"
            />
          </div>

          {/* Hazard Identification */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hazard Identification</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Identify Hazards *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {JHA_HAZARD_TYPES.map((hazard) => (
                  <label
                    key={hazard.value}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedHazards.includes(hazard.value)}
                      onChange={() => toggleHazard(hazard.value)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{hazard.label}</span>
                  </label>
                ))}
              </div>
              {errors.hazards_identified && (
                <p className="text-sm text-red-600 mt-2">{errors.hazards_identified.message}</p>
              )}
            </div>

            {/* Risk Level */}
            <Select
              label="Overall Risk Level *"
              {...register('risk_level')}
              options={JHA_RISK_LEVELS}
              error={errors.risk_level?.message}
              className="mt-4"
            />
          </div>

          {/* Control Measures */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Control Measures</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Control Measures *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {JHA_CONTROL_MEASURES.map((control) => (
                  <label
                    key={control.value}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedControls.includes(control.value)}
                      onChange={() => toggleControl(control.value)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{control.label}</span>
                  </label>
                ))}
              </div>
              {errors.control_measures && (
                <p className="text-sm text-red-600 mt-2">{errors.control_measures.message}</p>
              )}
            </div>

            {/* PPE Required */}
            <Input
              label="PPE Required (optional)"
              {...register('ppe_required')}
              placeholder="e.g., Safety goggles, gloves, lab coat"
              error={errors.ppe_required?.message}
              className="mt-4"
            />

            {/* Additional Controls */}
            <Textarea
              label="Additional Controls/Notes (optional)"
              {...register('additional_controls')}
              placeholder="Any other safety measures or special considerations..."
              rows={3}
              error={errors.additional_controls?.message}
              className="mt-4"
            />
          </div>

          {/* Priority */}
          <Select
            label="Priority Level *"
            {...register('priority')}
            options={PRIORITY_LEVELS}
            error={errors.priority?.message}
          />

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo Evidence (optional, up to 5 photos)
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
                  <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors">
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
                  <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors">
                    <Upload className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">Upload Photos</span>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Prepared By Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Prepared By (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Your Name"
                {...register('prepared_by')}
                placeholder="Optional"
                error={errors.prepared_by?.message}
              />

              <Input
                label="Your Email"
                type="email"
                {...register('prepared_by_email')}
                placeholder="Optional"
                error={errors.prepared_by_email?.message}
              />
            </div>

            <Input
              label="Reviewed By (optional)"
              {...register('reviewed_by')}
              placeholder="Name of reviewer/supervisor"
              error={errors.reviewed_by?.message}
              className="mt-4"
            />
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
              {isPending ? 'Submitting...' : 'Submit JHA'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
