import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticationService } from './authentication.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoggedUserRdo } from '../rdo/logged-user.rdo';
import { UserRdo } from '../rdo/user.rdo';
import { AuthenticationResponseMessage } from './authentication.constant';
import { MongoIdValidationPipe } from '@project/shared-pipes';
import { fillDto } from '@project/shared-helpers';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { NotificationsService } from '@project/user-notifications';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { RequestWithUser } from './request-with-user.interface';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { RequestWithTokenPayload } from './request-with-token-payload.interface';

@ApiTags('authentication')
@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly notificationsService: NotificationsService
  ) {}

  @ApiResponse({
    status: HttpStatus.CREATED,
    description: AuthenticationResponseMessage.UserCreated,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: AuthenticationResponseMessage.UserExist,
  })
  @Post('register')
  public async create(@Body() dto: CreateUserDto) {
    const newUser = await this.authService.register(dto);
    const { email, name } = newUser;
    await this.notificationsService.registerSubscriber({ email, name });

    return newUser.toPOJO();
  }

  @ApiResponse({
    type: LoggedUserRdo,
    status: HttpStatus.OK,
    description: AuthenticationResponseMessage.LoggedSuccess,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: AuthenticationResponseMessage.LoggedError,
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  public async login(@Req() { user }: RequestWithUser) {
    const userToken = await this.authService.createUserToken(user);
    return fillDto(LoggedUserRdo, { ...user.toPOJO(), ...userToken });
  }

  @ApiResponse({
    type: UserRdo,
    status: HttpStatus.OK,
    description: AuthenticationResponseMessage.UserFound,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: AuthenticationResponseMessage.UserNotFound,
  })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  public async show(@Param('id', MongoIdValidationPipe) id: string) {
    const existUser = await this.authService.getUser(id);
    return existUser.toPOJO();
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get a new access/refresh tokens',
  })
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  public async refreshToken(@Req() { user }: RequestWithUser) {
    return this.authService.createUserToken(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('check')
  public async checkToken(@Req() { user: payload }: RequestWithTokenPayload) {
    return payload;
  }
}
