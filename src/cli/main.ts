import { Module } from '@nestjs/common';
import { InitDatabaseCommand } from './init-database.command';
import { CommandFactory } from 'nest-commander';
import { CoreModule } from '../core/core.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [CoreModule, ConfigModule.forRoot({ isGlobal: true }),],
  providers: [InitDatabaseCommand],
})
export class AppModule {}

async function bootstrap() {
  await CommandFactory.run(AppModule, ['warn', 'error']);
}

bootstrap().catch(console.error);
