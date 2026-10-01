import { combineReducers } from '@reduxjs/toolkit';
import healthReducer from '../features/health/healthSlice';
import buildingStuffsReducer from '../features/buildingStuffs/buildingStuffsSlice';
import hitLoggerReducer from '../features/hitLogger/hitLoggerSlice';
import logsReducer from '../features/logs/logsSlice';
import notificationReducer from '../features/notifications/notificationSlice';
import nextTokenReducer from '../features/nextToken/nextTokenSlice';
import budgetReducer from '../features/budget/budgetSlice';

const rootReducer = combineReducers({
  budget: budgetReducer,
  nextToken: nextTokenReducer,
  health: healthReducer,
  buildingStuffs: buildingStuffsReducer,
  hitLogger: hitLoggerReducer,
  logs: logsReducer,
  notifications: notificationReducer,
});

export default rootReducer;
