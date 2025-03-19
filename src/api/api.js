
import axios from "axios";
const API_URL = "https://momentum.redberryinternship.ge/api";
const token = "9e7817b2-3490-40bc-8777-e62566678ad3";

const API = {
    fetchTasks: async () => {
        const response = await axios.get(
          `${API_URL}/tasks`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              accept: "application/json",
            },
          }
        );
        return response.data;
     },
      fetchTaskById: async (taskId) => {
        const response = await axios.get(`${API_URL}/tasks/${taskId}`, {
            headers: { Authorization: `Bearer ${token}`, accept: "application/json" }
        });
        return response.data;
      },
      updateTaskStatus: async (taskId, statusId) => {
        const response = await axios.put(
            `${API_URL}/tasks/${taskId}`,
            { status_id: statusId },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    accept: "application/json",
                },
            }
        );
        return response.data;
      },
      fetchComments: async (taskId) => {
        const response = await axios.get(`${API_URL}/tasks/${taskId}/comments`, {
            headers: { Authorization: `Bearer ${token}`, accept: "application/json" }
        });
        return response.data;
      },
      addComment: async (taskId, text, parentId = null) => {
        const response = await axios.post(
            `${API_URL}/tasks/${taskId}/comments`,
            { text, parent_id: parentId },
            { headers: { Authorization: `Bearer ${token}`, accept: "application/json" } }
        );
        return response.data;
    },
     fetchEmployees: async () => {
      const response = await axios.get(
        `${API_URL}/employees`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
        }
      );
      return response.data;
   },
     fetchStatuses: async () => {
      const response = await axios.get(
        `${API_URL}/statuses`,
        {
          headers: {
            accept: "application/json",
          },
        }
      );
      return response.data;
   },
   fetchDepartments: async () => {
    const response = await axios.get(
      `${API_URL}/departments`,
      {
        headers: {
          accept: "application/json",
        },
      }
    );
    return response.data;
  },
  fetchPriorities: async () => {
    const response = await axios.get(
      `${API_URL}/priorities`,
      {
        headers: {
          accept: "application/json",
        },
      }
    );
    return response.data;
  }
};
export default API;