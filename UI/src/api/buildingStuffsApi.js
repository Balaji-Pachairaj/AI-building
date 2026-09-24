import axiosClient from './axiosClient';
import { ENDPOINTS } from './endpoints';

/**
 * Fetch all building stuffs
 */
export const fetchBuildingStuffs = async () => {
  const response = await axiosClient.get(ENDPOINTS.BUILDING_STUFFS);
  return response.data;
};

/**
 * Fetch a single building stuff item by ID
 */
export const fetchBuildingStuffById = async (id) => {
  const response = await axiosClient.get(ENDPOINTS.BUILDING_STUFFS_BY_ID(id));
  return response.data;
};

/**
 * Create a new building stuff item
 */
export const createBuildingStuff = async (payload) => {
  const response = await axiosClient.post(ENDPOINTS.BUILDING_STUFFS, payload);
  return response.data;
};

/**
 * Hit building stuff (registers hit time & hit body into MongoDB Log)
 */
export const hitBuildingStuff = async (payload) => {
  const response = await axiosClient.post(ENDPOINTS.BUILDING_STUFFS_HIT, payload);
  return response.data;
};
