import { jest } from '@jest/globals';
import { databaseService } from '../lib/database';
import { db } from './__mocks__/firebase/config';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc,
  query,
  where 
} from 'firebase/firestore';

// Mock Firebase
jest.mock('../firebase/config');
jest.mock('firebase/firestore');

describe('Database Service Tests', () => {
  const mockUserId = 'test-user-id';
  const mockProjectId = 'test-project-id';
  const mockTaskId = 'test-task-id';

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Project Operations', () => {
    test('listProjects should fetch all projects for a user', async () => {
      const mockProjects = [
        { id: '1', title: 'Project 1', createdAt: new Date() },
        { id: '2', title: 'Project 2', createdAt: new Date() }
      ];

      getDocs.mockResolvedValueOnce({
        docs: mockProjects.map(project => ({
          id: project.id,
          data: () => project
        }))
      });

      const result = await databaseService.listProjects(mockUserId);
      expect(result.success).toBe(true);
      expect(result.projects).toHaveLength(2);
      expect(getDocs).toHaveBeenCalled();
    });

    test('createProject should create a new project', async () => {
      const mockProject = {
        title: 'New Project',
        description: 'Test Description'
      };

      setDoc.mockResolvedValueOnce();

      const result = await databaseService.createProject(mockUserId, mockProject);
      expect(result.success).toBe(true);
      expect(result.project.title).toBe(mockProject.title);
      expect(setDoc).toHaveBeenCalled();
    });
  });

  describe('Task Operations', () => {
    test('listProjectTasks should fetch all tasks for a project', async () => {
      const mockTasks = [
        { id: '1', title: 'Task 1', status: 'todo' },
        { id: '2', title: 'Task 2', status: 'in-progress' }
      ];

      getDocs.mockResolvedValueOnce({
        docs: mockTasks.map(task => ({
          id: task.id,
          data: () => task
        }))
      });

      const result = await databaseService.listProjectTasks(mockUserId, mockProjectId);
      expect(result.success).toBe(true);
      expect(result.tasks).toHaveLength(2);
      expect(getDocs).toHaveBeenCalled();
    });

    test('createTask should create a new task', async () => {
      const mockTask = {
        title: 'New Task',
        description: 'Test Task'
      };

      setDoc.mockResolvedValueOnce();

      const result = await databaseService.createTask(mockUserId, mockProjectId, mockTask);
      expect(result.success).toBe(true);
      expect(result.task.title).toBe(mockTask.title);
      expect(setDoc).toHaveBeenCalled();
    });
  });
}); 