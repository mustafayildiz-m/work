import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    update(id: number, updateUserDto: Partial<CreateUserDto>): Promise<User | null>;
    updateProfile(id: number, updateUserDto: UpdateUserDto): Promise<User | null>;
    changePassword(id: number, changePasswordDto: ChangePasswordDto): Promise<void>;
    remove(id: number): Promise<void>;
    findOnePublic(id: number): Promise<User | null>;
}
