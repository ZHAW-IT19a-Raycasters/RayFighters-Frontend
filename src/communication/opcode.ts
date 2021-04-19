/**
 * All Opcodes from client and server.
 * See https://github.zhaw.ch/raycasters/docs/wiki/Protocol#frontend
 * and https://github.zhaw.ch/raycasters/docs/wiki/Protocol#server
 */
 export enum OpCode {
    // Frontend
    CLIENT_DISCONNECT = 0x00,
    CLIENT_UNKNOWN = 0x01,
    CLIENT_WHOAMI = 0x02,
    CLIENT_MOVEMENT = 0x0A,
    CLIENT_SHOOTING = 0x14,
    CLIENT_REQUESTPLAYERINFO = 0x1E,
    CLIENT_REQUESTPLAYERKD = 0x1F,

    // Server
    SERVER_DISCONNECT = 0x64,
    SERVER_UNKNOWN = 0x65,
    SERVER_MOVEMENT = 0x6E,
    SERVER_PLAYERDEATH = 0x78,
    SERVER_PLAYERJOINED = 0x7A,
    SERVER_PLAYERLEFT = 0x7B,
    SERVER_YOUARECALLED = 0x7C,
    SERVER_SENDALLPLAYERINFO = 0x82,
    SERVER_SENDALLPLAYERKD = 0x83
}