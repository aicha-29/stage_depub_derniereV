export const createNotification = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      "http://localhost:5001/api/notifications",
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const token = localStorage.getItem("token");
    await axios.patch(
      `http://localhost:5001/api/notifications/${notificationId}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(
      `http://localhost:5001/api/notifications/${notificationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};