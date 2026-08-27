-- AlterTable: kakao 발주 명령어 (like/join/channel_add/…). urpanel 은 serviceId, kakao 는 command 로 매핑.
ALTER TABLE "ProductOption" ADD COLUMN "externalCommand" TEXT;
