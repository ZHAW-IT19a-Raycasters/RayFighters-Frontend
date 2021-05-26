import { PacketFactory } from "../src/communication/packetfactory";
import { Packet } from "../src/communication/packet";
import { ProtocolParser } from "../src/communication/protocolparser";

describe('PacketFactory wrapper test', () => {
    it('should generate a packet representing disconnect, unknown, who am i, request player info and request player kill/death data correctly', () => {
        let byteData: Uint8Array;
        let packet: Packet;

        packet = PacketFactory.disconnect();
        byteData = ProtocolParser.get.serialize(packet);
        expect(byteData[0]).toBe(0x00);
        expect(byteData.length).toBe(1);

        packet = PacketFactory.unknown();
        byteData = ProtocolParser.get.serialize(packet);
        expect(byteData[0]).toBe(0x01);
        expect(byteData.length).toBe(1);

        packet = PacketFactory.whoAmI();
        byteData = ProtocolParser.get.serialize(packet);
        expect(byteData[0]).toBe(0x02);
        expect(byteData.length).toBe(1);

        packet = PacketFactory.requestPlayerInfo();
        byteData = ProtocolParser.get.serialize(packet);
        expect(byteData[0]).toBe(0x1E);
        expect(byteData.length).toBe(1);

        packet = PacketFactory.requestPlayerKillDeathCount();
        byteData = ProtocolParser.get.serialize(packet);
        expect(byteData[0]).toBe(0x1F);
        expect(byteData.length).toBe(1);
    })

    it('should generate a packet representing movement data correctly', () => {
        const expectedData = [
            0x0A,                                               // Opcode
            0x00, 0x00, 0x00, 0x00, 0x00, 0xD0, 0x84, 0x40,     // X movement (666.0)
            0xA2, 0x45, 0xB6, 0xF3, 0xFD, 0x3F, 0x8F, 0x40,     // Y movement (999.999)
            0xA2, 0x45, 0xB6, 0xF3, 0xFD, 0x3F, 0x8F, 0x40      // angle (999.999)
        ];    
        const packet: Packet = PacketFactory.move(666.0, 999.999, 999.999)
        const byteData = ProtocolParser.get.serialize(packet);
        expect(byteData.length).toBe(expectedData.length);
        for (let index = 0; index < expectedData.length; index++) {
            expect(byteData[index]).toBe(expectedData[index]);
        }
    })

    it('should generate a packet representing shooting correctly', () => {
        const expectedData = [
            0x14,                                               // Opcode
            0x9A, 0x99, 0x99, 0x99, 0x99, 0x99, 0x1B, 0x40      // Angle (6.9)
        ];
        const packet: Packet = PacketFactory.shoot(6.9)
        const byteData = ProtocolParser.get.serialize(packet);
        expect(byteData.length).toBe(expectedData.length);
        for (let index = 0; index < expectedData.length; index++) {
            expect(byteData[index]).toBe(expectedData[index]);
        }
    })
})
