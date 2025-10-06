// bootstrap-api.js

// Simulated bootstrap API call
export async function fetchBootstrapData(page = 1, pageSize = 10) {
  // Simulated latency
  await new Promise(res => setTimeout(res, 300));

  return {
    "user": {
      "id": 1,
      "username": "vamkat",
      "avatar": "V",
      // "status": "online"
    },
    "categoriesMockApi":
    {
      "categories": [
        { "id": 2, "name": "Tech" },
        { "id": 3, "name": "Music" },
        { "id": 4, "name": "Science" },

      ],
      "have_more_categories": false,
    },
    "postsMockApi":
    {
      "posts": [
        {
          "id": 5,
          "creator": {
            "id": 1,
            "username": "vamkat",
            "avatar": "V"
          },
          "created_at": "20/8/2025 18:07", // check format, make local
          "title": "JS sucks. Sorry but it needed to be said.",
          "body": "Lorem ipsum dolor sit amet...",
          "reaction_count": { "❤️": 1, "😂": 3, "😮": 1 },
          "current_user_reactions": ["❤️", "😂"],
          "comment_count": 1582,
          "categories": [
            { "id": 2, "name": "Tech" },
            { "id": 3, "name": "Music" },],
          "truncated": true,
        },
        {
          "id": 6,
          "creator": {
            "id": 30,
            "username": "smanousi",
            "avatar": "S",
          },
          "created_at": "21/8/2025 11:03",
          "title": "Stamatius Maximus",
          "body": "Aenean vulputate eleifend tellus...",
          "reaction_count": { "❤️": 1, "😂": 3, "😮": 1 },
          "current_user_reactions": ["😂"],
          "comment_count": 15,
          "categories": [
            { "id": 2, "name": "Tech" },
            { "id": 3, "name": "Music" },
          ]
        },
        {
          "id": 7,
          "creator": {
            "id": 301,
            "username": "Ronaldo",
            "avatar": "R",
          },
          "created_at": "21/8/2025 11:03",
          "title": "It wasnt a penalty",
          "body": "Aenean vulputate eleifend tellus...",
          "reaction_count": { "❤️": 1500, "😂": 3302, "😮": 103627 },
          "current_user_reactions": ["❤️", "😮"],
          "comment_count": 1545,
          "categories": [
            { "id": 2, "name": "Tech" },
            { "id": 3, "name": "Music" },
          ]
        },
        {
          "id": 8,
          "creator": {
            "id": 302,
            "username": "Kostas",
            "avatar": "K",
          },
          "created_at": "21/8/2025 11:03",
          "title": "Best places to eat",
          "body": "Aenean vulputate eleifend tellus...",
          "reaction_count": { "❤️": 1500, "😂": 3302, "😮": 103627 },
          "comment_count": 1545,
          "categories": [
            { "id": 2, "name": "Tech" },
            { "id": 3, "name": "Music" },
          ]
        },
      ],
      "have_more_posts": true,
    },
    "usersMockApi":
    {
      "users_feed": [
        {
          "user":
            { "id": 50, "username": "vstefano", "avatar": "S", "status": "online" },
          "conversation_details":
            { "id": 15, "unread_count": 5, "last_read_message_id": 206 }
        },
        {
          "user":
            { "id": 51, "username": "agioldas", "avatar": "A", "status": "offline", },
          "conversation_details":
            { "id": 16, "unread_count": 7, "last_read_message_id": 205 }
        },
        {
          "user":
            { "id": 52, "username": "smanousi", "avatar": "S", "status": "online", },
          "conversation_details":
            { "id": 16, "unread_count": 7, "last_read_message_id": 207 }
        },
        {
          "user":
            { "id": 53, "username": "NotAFriend", "avatar": "U", "status": "online", }
        },
        {
          "user":
            { "id": 54, "username": "Offline", "avatar": "U", "status": "", }
        },
        {
          "user":
            { "id": 54, "username": "Offline", "avatar": "U", "status": "", }
        },
        {
          "user":
            { "id": 54, "username": "Offline", "avatar": "U", "status": "", }
        },
        {
          "user":
            { "id": 54, "username": "Offline", "avatar": "U", "status": "", }
        },
        {
          "user":
            { "id": 54, "username": "Offline", "avatar": "U", "status": "", }
        },
        {
          "user":
            { "id": 54, "username": "Offline", "avatar": "U", "status": "", }
        },
        {
          "user":
            { "id": 54, "username": "Offline", "avatar": "U", "status": "", }
        },
        {
          "user":
            { "id": 54, "username": "Offline", "avatar": "U", "status": "", }
        },
        {
          "user":
            { "id": 54, "username": "Offline", "avatar": "U", "status": "", }
        },
      ],
      "have_more_users": true,
    },
  };
}



// Simulated API call for a single post
export async function fetchPostById(postId) {
  await new Promise(res => setTimeout(res, 200)); // Simulated latency

  const mockPost = {
    "id": 5,
    "creator": {
      "id": 1,
      "username": "vamkat",
      "avatar": "V"
    },
    "created_at": "20/8/2025 18:07", // check format, make local
    "title": "JS sucks. Sorry but it needed to be said.",
    "body": "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. \n Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc,",
    "reaction_count": { "❤️": 1, "😂": 3, "😮": 1 },
    "comment_count": 2,
    "current_user_reactions": ["❤️", "😂"],
    "categories": [
      { "id": 2, "name": "Tech" },
      { "id": 3, "name": "Music" },]
  }


  return mockPost || null;
}

export async function fetchComments(postId) {
  await new Promise(res => setTimeout(res, 200)); // Simulated latency
  const mockComments = {
    "comments":
      [
        {
          "id": 10,
          "parent_id": 5,
          "body": "No, JS rocks!",
          "reaction_count": { "😂": 1 },
          "creator": {
            "id": 52,
            "username": "smanousi",
            "avatar": "S",
            "status": "online",
          },
          "current_user_reactions": ["😂"],
          "created_at": "20/8/2025 19:12",

        },
        {
          "id": 9,
          "parent_id": 5,
          "body": "I completely agree",
          "reaction_count": { "❤️": 154 },
          "creator": {
            "id": 54,
            "username": "Offline",
            "avatar": "U",
            "status": "offline",
          },
          "current_user_reactions": ["❤️"],
          "created_at": "20/8/2025 19:11",

        },
        {
          "id": 8,
          "parent_id": 5,
          "body": "Meh",
          "creator": {
            "id": 52,
            "username": "smanousi",
            "avatar": "S",
            "status": "online",
          },
          "created_at": "20/8/2025 19:05",

        }

      ],
    "have_more_comments": false,
  }
  return mockComments || null;
}

export async function fetchMessages(conversationId) {//206 last unread
  const mockMessages = {
    "messages":
      [
        {
          "id": 200,
          "conversation_id": 15,
          "creator": { "id": 50, "username": "vstefano", "avatar": "S", "status": "online" },
          "body": "Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.",
          "reaction_count": { "❤️": 1 },
          "current_user_reactions": ["❤️"],
          "created_at": "4/9/2025 18:07",
          "delivered": true,
          "seen": true,
        },
        {
          "id": 201,
          "conversation_id": 15,
          "creator": { "id": 1, "username": "vamkat", "avatar": "V", "status": "online" },
          "body": " Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          "created_at": "4/9/2025 18:09",
          "delivered": true,
          "seen": true,
        },
        {
          "id": 202,
          "conversation_id": 15,
          "creator": { "id": 50, "username": "vstefano", "avatar": "S", "status": "online" },
          "body": "Nullam quis ante.",
          "created_at": "4/9/2025 18:17",
          "delivered": true,
          "seen": true,
        },
        {
          "id": 203,
          "conversation_id": 15,
          "creator": { "id": 1, "username": "vamkat", "avatar": "V", "status": "online" },
          "body": " Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet.",
          "created_at": "4/9/2025 18:19",
          "reaction_count": { "😂": 1 },
          "delivered": true,
          "seen": true,
        },
        {
          "id": 206,
          "conversation_id": 15,
          "creator": { "id": 50, "username": "vstefano", "avatar": "S", "status": "online" },
          "body": "Fusce in lacus ac nunc tristique vehicula. Suspendisse potenti. Quisque vel auctor lacus. Sed non pretium dui. Morbi blandit in elit et aliquam. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Mauris non justo nec justo semper lobortis.",
          "created_at": "4/9/2025 18:20",
          "delivered": true,
          "seen": true,
        },
        {
          "id": 207,
          "conversation_id": 15,
          "creator": { "id": 50, "username": "vstefano", "avatar": "S", "status": "online" },
          "body": "Pellentesque at ligula et justo venenatis bibendum. ",
          "created_at": "4/9/2025 18:32",
          "delivered": true,
          "seen": false,
        },
        {
          "id": 208,
          "conversation_id": 15,
          "creator": { "id": 50, "username": "vstefano", "avatar": "S", "status": "online" },
          "body": " Praesent ornare felis nibh, eget posuere neque maximus sit amet. ",
          "created_at": "4/9/2025 18:33",
          "delivered": true,
          "seen": false,
        },
        {
          "id": 209,
          "conversation_id": 15,
          "creator": { "id": 50, "username": "vstefano", "avatar": "S", "status": "online" },
          "body": "Sed pellentesque diam et mollis lacinia.",
          "created_at": "4/9/2025 18:34",
          "delivered": true,
          "seen": false,
        },
        {
          "id": 210,
          "conversation_id": 15,
          "creator": { "id": 50, "username": "vstefano", "avatar": "S", "status": "online" },
          "body": "Curabitur nec velit nunc.",
          "created_at": "4/9/2025 18:37",
          "delivered": true,
          "seen": false,
        },
        {
          "id": 211,
          "conversation_id": 15,
          "creator": { "id": 50, "username": "vstefano", "avatar": "S", "status": "online" },
          "body": "Aenean auctor, leo eu placerat feugiat, lectus orci vestibulum leo, eu volutpat tortor est et est.",
          "created_at": "4/9/2025 18:40",
          "delivered": true,
          "seen": false,
        },


      ],
    "have_more_dms_before": true,
    "have_more_dms_after": true,
  }
  return mockMessages || null;
}


export async function fetchOlderMessages(conversationId) {//206 last unread
  const mockMessages = {
    "messages": [
      {

        "id": 190,
        "conversation_id": 15,
        "creator": { "id": 50, "username": "vstefano", "avatar": "S", "status": "online" },
        "body": "Message 190",
        "reaction_count": { "❤️": 1 },
        "current_user_reactions": ["❤️"],
        "created_at": "3/9/2025 11:47",
        "delivered": true,
        "seen": true,
      },

      {

        "id": 191,
        "conversation_id": 15,
        "creator": { "id": 1, "username": "vamkat", "avatar": "V", "status": "online" },
        "body": "Message 191",
        "created_at": "3/9/2025 11:49",
        "delivered": true,
        "seen": true,
      },
      {
        "id": 192,
        "conversation_id": 15,
        "creator": { "id": 50, "username": "vstefano", "avatar": "S", "status": "online" },
        "body": "Message 192",
        "created_at": "3/9/2025 11:56",
        "delivered": true,
        "seen": true,
      },
      {
        "id": 193,
        "conversation_id": 15,
        "creator": { "id": 1, "username": "vamkat", "avatar": "V", "status": "online" },
        "body": "Message 193",
        "created_at": "3/9/2025 12:11",
        "reaction_count": { "😂": 1 },
        "delivered": true,
        "seen": true,
      },
      {
        "id": 194,
        "conversation_id": 15,
        "creator": { "id": 50, "username": "vstefano", "avatar": "S", "status": "online" },
        "body": "Message 194",
        "created_at": "3/9/2025 12:20",
        "delivered": true,
        "seen": true,
      },
      {
        "id": 195,
        "conversation_id": 15,
        "creator": { "id": 50, "username": "vstefano", "avatar": "S", "status": "online" },
        "body": "Message 195",
        "created_at": "3/9/2025 12:32",
        "delivered": true,
        "seen": false,
      },
      {
        "id": 196,
        "conversation_id": 15,
        "creator": { "id": 50, "username": "vstefano", "avatar": "S", "status": "online" },
        "body": "Message 196",
        "created_at": "3/9/2025 12:33",
        "delivered": true,
        "seen": false,
      },
      {
        "id": 197,
        "conversation_id": 15,
        "creator": { "id": 50, "username": "vstefano", "avatar": "S", "status": "online" },
        "body": "Message 197",
        "created_at": "3/9/2025 12:50",
        "delivered": true,
        "seen": false,
      },
      {
        "id": 198,
        "conversation_id": 15,
        "creator": { "id": 50, "username": "vstefano", "avatar": "S", "status": "online" },
        "body": "Message 198",
        "created_at": "3/9/2025 12:57",
        "delivered": true,
        "seen": false,
      },
      {
        "id": 199,
        "conversation_id": 15,
        "creator": { "id": 50, "username": "vstefano", "avatar": "S", "status": "online" },
        "body": "Message 199",
        "created_at": "3/9/2025 13:05",
        "delivered": true,
        "seen": false,
      },

    ],
    "have_more_dms_before": false,
    "have_more_dms_after": true,
  }

  return mockMessages || null;
}

export async function fetchNewerMessages(conversationId) {//206 last unread
  const mockMessages = {
    "messages": [
      {
        "id": 212,
        "conversation_id": 15,
        "creator": { "id": 50, "username": "vstefano", "avatar": "S", "status": "online" },
        "body": "Message 212",
        "reaction_count": { "❤️": 1 },
        "current_user_reactions": ["❤️"],
        "created_at": "4/9/2025 18:57",
        "delivered": true,
        "seen": true,
      },
      {
        "id": 213,
        "conversation_id": 15,
        "creator": { "id": 1, "username": "vamkat", "avatar": "V", "status": "online" },
        "body": "Message 213",
        "created_at": "4/9/2025 18:59",
        "delivered": true,
        "seen": true,
      },
      {
        "id": 214,
        "conversation_id": 15,
        "creator": { "id": 50, "username": "vstefano", "avatar": "S", "status": "online" },
        "body": "Message 214",
        "created_at": "4/9/2025 19:00",
        "delivered": true,
        "seen": true,
      },

    ],
    "have_more_dms_before": true,
    "have_more_dms_after": false,
  }

  return mockMessages || null;
}

export async function newDm(){
    await new Promise(res => setTimeout(res, 200)); // Simulated latency


  const dm = {
    "message_id": 215,
   "conversation_id":6000,
   "created_at": "15/9/2025 19:00"
  }

  return dm || null;
}

