import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { TaskCategory } from '@/data/taskCategories';

export interface TaskImage {
  uri: string;
  id: string;
}

export interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
}

export interface TaskFormData {
  category: TaskCategory | null;
  title: string;
  description: string;
  specialInstructions: string;
  pickup: LocationData | null;
  dropoff: LocationData | null;
  images: TaskImage[];
  vehicleType: string | null;
}

type TaskAction =
  | { type: 'SET_CATEGORY'; payload: TaskCategory }
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'SET_SPECIAL_INSTRUCTIONS'; payload: string }
  | { type: 'SET_PICKUP'; payload: LocationData }
  | { type: 'SET_DROPOFF'; payload: LocationData }
  | { type: 'ADD_IMAGES'; payload: TaskImage[] }
  | { type: 'REMOVE_IMAGE'; payload: string }
  | { type: 'SET_VEHICLE_TYPE'; payload: string | null }
  | { type: 'RESET' };

const initialState: TaskFormData = {
  category: null,
  title: '',
  description: '',
  specialInstructions: '',
  pickup: null,
  dropoff: null,
  images: [],
  vehicleType: null,
};

function taskReducer(state: TaskFormData, action: TaskAction): TaskFormData {
  switch (action.type) {
    case 'SET_CATEGORY':
      return { ...state, category: action.payload };
    case 'SET_TITLE':
      return { ...state, title: action.payload };
    case 'SET_DESCRIPTION':
      return { ...state, description: action.payload };
    case 'SET_SPECIAL_INSTRUCTIONS':
      return { ...state, specialInstructions: action.payload };
    case 'SET_PICKUP':
      return { ...state, pickup: action.payload };
    case 'SET_DROPOFF':
      return { ...state, dropoff: action.payload };
    case 'ADD_IMAGES':
      return { ...state, images: [...state.images, ...action.payload].slice(0, 5) };
    case 'REMOVE_IMAGE':
      return { ...state, images: state.images.filter((img) => img.id !== action.payload) };
    case 'SET_VEHICLE_TYPE':
      return { ...state, vehicleType: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface TaskContextValue {
  state: TaskFormData;
  setCategory: (category: TaskCategory) => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setSpecialInstructions: (instructions: string) => void;
  setPickup: (location: LocationData) => void;
  setDropoff: (location: LocationData) => void;
  addImages: (images: TaskImage[]) => void;
  removeImage: (id: string) => void;
  setVehicleType: (type: string | null) => void;
  resetTask: () => void;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  const setCategory = useCallback((category: TaskCategory) => {
    dispatch({ type: 'SET_CATEGORY', payload: category });
  }, []);

  const setTitle = useCallback((title: string) => {
    dispatch({ type: 'SET_TITLE', payload: title });
  }, []);

  const setDescription = useCallback((description: string) => {
    dispatch({ type: 'SET_DESCRIPTION', payload: description });
  }, []);

  const setSpecialInstructions = useCallback((instructions: string) => {
    dispatch({ type: 'SET_SPECIAL_INSTRUCTIONS', payload: instructions });
  }, []);

  const setPickup = useCallback((location: LocationData) => {
    dispatch({ type: 'SET_PICKUP', payload: location });
  }, []);

  const setDropoff = useCallback((location: LocationData) => {
    dispatch({ type: 'SET_DROPOFF', payload: location });
  }, []);

  const addImages = useCallback((images: TaskImage[]) => {
    dispatch({ type: 'ADD_IMAGES', payload: images });
  }, []);

  const removeImage = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_IMAGE', payload: id });
  }, []);

  const setVehicleType = useCallback((type: string | null) => {
    dispatch({ type: 'SET_VEHICLE_TYPE', payload: type });
  }, []);

  const resetTask = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return (
    <TaskContext.Provider
      value={{
        state,
        setCategory,
        setTitle,
        setDescription,
        setSpecialInstructions,
        setPickup,
        setDropoff,
        addImages,
        removeImage,
        setVehicleType,
        resetTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext(): TaskContextValue {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}
