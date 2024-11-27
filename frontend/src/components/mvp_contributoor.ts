/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/mvp_contributoor.json`.
 */
export type MvpContributoor = {
  "address": "2Gy7qY6QX6cBF6WDXY4vssoskAq29witMf4JcSmh1jQd",
  "metadata": {
    "name": "mvpContributoor",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "approveTask",
      "discriminator": [
        81,
        171,
        95,
        228,
        10,
        231,
        167,
        225
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "project",
          "writable": true
        },
        {
          "name": "task",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  115,
                  107,
                  45,
                  105,
                  110,
                  102,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "project"
              },
              {
                "kind": "arg",
                "path": "taskId"
              }
            ]
          }
        },
        {
          "name": "taskAssignment",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  115,
                  107,
                  45,
                  97,
                  115,
                  115,
                  105,
                  103,
                  110,
                  109,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "task"
              },
              {
                "kind": "account",
                "path": "task.assignee",
                "account": "task"
              }
            ]
          }
        },
        {
          "name": "contributor",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  116,
                  114,
                  105,
                  98,
                  117,
                  116,
                  111,
                  114,
                  45,
                  105,
                  110,
                  102,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "task.assignee",
                "account": "task"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "taskId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claimTask",
      "discriminator": [
        49,
        222,
        219,
        238,
        155,
        68,
        221,
        136
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "project",
          "writable": true
        },
        {
          "name": "task",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  115,
                  107,
                  45,
                  105,
                  110,
                  102,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "project"
              },
              {
                "kind": "arg",
                "path": "taskId"
              }
            ]
          }
        },
        {
          "name": "taskAssignment",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  115,
                  107,
                  45,
                  97,
                  115,
                  115,
                  105,
                  103,
                  110,
                  109,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "task"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "contributor",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  116,
                  114,
                  105,
                  98,
                  117,
                  116,
                  111,
                  114,
                  45,
                  105,
                  110,
                  102,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "taskId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createTask",
      "discriminator": [
        194,
        80,
        6,
        180,
        232,
        127,
        48,
        171
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "project",
          "writable": true
        },
        {
          "name": "task",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  115,
                  107,
                  45,
                  105,
                  110,
                  102,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "project"
              },
              {
                "kind": "account",
                "path": "project.task_counter",
                "account": "project"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "taskName",
          "type": "string"
        },
        {
          "name": "taskDescription",
          "type": "string"
        },
        {
          "name": "duration",
          "type": "u32"
        }
      ]
    },
    {
      "name": "registerContributor",
      "discriminator": [
        14,
        116,
        59,
        252,
        26,
        253,
        91,
        175
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "contributor",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  116,
                  114,
                  105,
                  98,
                  117,
                  116,
                  111,
                  114,
                  45,
                  105,
                  110,
                  102,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "nameRegistry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  116,
                  114,
                  105,
                  98,
                  117,
                  116,
                  111,
                  114,
                  45,
                  110,
                  97,
                  109,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "name"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "contributorName",
          "type": "string"
        }
      ]
    },
    {
      "name": "registerProject",
      "discriminator": [
        130,
        150,
        121,
        216,
        183,
        225,
        243,
        192
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "project",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116,
                  45,
                  105,
                  110,
                  102,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "nameRegistry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  116,
                  114,
                  105,
                  98,
                  117,
                  116,
                  111,
                  114,
                  45,
                  110,
                  97,
                  109,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "name"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        }
      ]
    },
    {
      "name": "rejectTask",
      "discriminator": [
        152,
        59,
        207,
        37,
        222,
        254,
        28,
        106
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "project",
          "writable": true
        },
        {
          "name": "task",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  115,
                  107,
                  45,
                  105,
                  110,
                  102,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "project"
              },
              {
                "kind": "arg",
                "path": "taskId"
              }
            ]
          }
        },
        {
          "name": "taskAssignment",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  115,
                  107,
                  45,
                  97,
                  115,
                  115,
                  105,
                  103,
                  110,
                  109,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "task"
              },
              {
                "kind": "account",
                "path": "task.assignee",
                "account": "task"
              }
            ]
          }
        },
        {
          "name": "contributor",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  116,
                  114,
                  105,
                  98,
                  117,
                  116,
                  111,
                  114,
                  45,
                  105,
                  110,
                  102,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "task.assignee",
                "account": "task"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "taskId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "submitTask",
      "discriminator": [
        148,
        183,
        26,
        116,
        107,
        213,
        118,
        213
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "project",
          "writable": true
        },
        {
          "name": "task",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  115,
                  107,
                  45,
                  105,
                  110,
                  102,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "project"
              },
              {
                "kind": "arg",
                "path": "taskId"
              }
            ]
          }
        },
        {
          "name": "taskAssignment",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  115,
                  107,
                  45,
                  97,
                  115,
                  115,
                  105,
                  103,
                  110,
                  109,
                  101,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "task"
              },
              {
                "kind": "account",
                "path": "task.assignee",
                "account": "task"
              }
            ]
          }
        },
        {
          "name": "contributor",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  116,
                  114,
                  105,
                  98,
                  117,
                  116,
                  111,
                  114,
                  45,
                  105,
                  110,
                  102,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "taskId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateTaskDuration",
      "discriminator": [
        177,
        215,
        163,
        99,
        163,
        137,
        89,
        185
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "project",
          "writable": true
        },
        {
          "name": "task",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  115,
                  107,
                  45,
                  105,
                  110,
                  102,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "project"
              },
              {
                "kind": "arg",
                "path": "taskId"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "taskId",
          "type": "u64"
        },
        {
          "name": "duration",
          "type": {
            "option": "u32"
          }
        }
      ]
    },
    {
      "name": "updateTaskInfo",
      "discriminator": [
        192,
        41,
        117,
        137,
        208,
        145,
        91,
        102
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "project",
          "writable": true
        },
        {
          "name": "task",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  115,
                  107,
                  45,
                  105,
                  110,
                  102,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "project"
              },
              {
                "kind": "arg",
                "path": "taskId"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "taskId",
          "type": "u64"
        },
        {
          "name": "taskName",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "taskDescription",
          "type": {
            "option": "string"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "contributor",
      "discriminator": [
        222,
        222,
        255,
        212,
        133,
        49,
        27,
        93
      ]
    },
    {
      "name": "nameRegistry",
      "discriminator": [
        169,
        63,
        83,
        240,
        198,
        158,
        53,
        11
      ]
    },
    {
      "name": "project",
      "discriminator": [
        205,
        168,
        189,
        202,
        181,
        247,
        142,
        19
      ]
    },
    {
      "name": "task",
      "discriminator": [
        79,
        34,
        229,
        55,
        88,
        90,
        55,
        84
      ]
    },
    {
      "name": "taskAssignment",
      "discriminator": [
        89,
        239,
        95,
        144,
        182,
        35,
        47,
        254
      ]
    }
  ],
  "events": [
    {
      "name": "taskEvent",
      "discriminator": [
        30,
        194,
        51,
        221,
        107,
        122,
        192,
        141
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorizedAccess",
      "msg": "You do not have sufficient privileges to create or update the task"
    },
    {
      "code": 6001,
      "name": "cannotClaimOwnTask",
      "msg": "Cannot claim your own task"
    },
    {
      "code": 6002,
      "name": "notTaskAssignee",
      "msg": "Only the assignee can complete the task"
    }
  ],
  "types": [
    {
      "name": "contributor",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "tasksProcess",
            "type": "u64"
          },
          {
            "name": "tasksCompleted",
            "type": "u64"
          },
          {
            "name": "tasksFailed",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "nameRegistry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "taken",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "project",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "taskCounter",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "task",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "assignee",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "project",
            "type": "pubkey"
          },
          {
            "name": "uuid",
            "type": "u64"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "taskStatus"
              }
            }
          },
          {
            "name": "duration",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "taskAssignment",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "taskId",
            "type": "u64"
          },
          {
            "name": "assignee",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "startTime",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "endTime",
            "type": {
              "option": "i64"
            }
          }
        ]
      }
    },
    {
      "name": "taskEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "uuid",
            "type": "u64"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "taskStatus"
              }
            }
          },
          {
            "name": "project",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "duration",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "taskStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "open"
          },
          {
            "name": "claimed"
          },
          {
            "name": "submitted"
          },
          {
            "name": "completed"
          }
        ]
      }
    }
  ]
};
