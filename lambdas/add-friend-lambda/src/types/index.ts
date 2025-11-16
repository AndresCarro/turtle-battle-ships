export interface AddFriendRequest {
  userId: number;
  friendId: number;
}

export interface AddFriendResponse {
  success: boolean;
  message: string;
  friendship?: {
    id: number;
    userId: number;
    friendId: number;
    status: 'pending' | 'accepted' | 'blocked';
    createdAt: string;
  };
}

export interface FriendshipRecord {
  id: number;
  user_id: number;
  friend_id: number;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: Date;
  updated_at: Date;
}