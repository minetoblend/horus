import { Test, TestingModule } from '@nestjs/testing';
import { CardgameController } from './cardgame.controller';

describe('CardgameController', () => {
  let controller: CardgameController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardgameController],
    }).compile();

    controller = module.get<CardgameController>(CardgameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
