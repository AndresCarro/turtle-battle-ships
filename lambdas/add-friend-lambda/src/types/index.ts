export interface AddFriendRequest {
  userName: string;
  friendName: string;
}

export interface AddFriendResponse {
  success: boolean;
  message: string;
  friendship?: {
    id: number;
    userName: string;
    friendName: string;
    createdAt: string;
  };
}

export interface FriendshipRecord {
  id: number;
  user_name: string;
  friend_name: string;
  created_at: Date;
  updated_at: Date;
}