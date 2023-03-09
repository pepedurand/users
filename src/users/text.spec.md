import axios from 'axios';
import { existsSync, readFileSync } from 'fs';
import { mocked } from 'ts-jest/utils';
import { UserModel } from './user.model';
import { ImageModel } from './image.model';
import { findUserAvatar } from './findUserAvatar';

// Mock axios and file system methods
jest.mock('axios');
jest.mock('fs');

describe('findUserAvatar', () => {
const \_id = '123';
const avatarUrl = 'https://example.com/avatar.jpg';
const avatarBase64 = 'image-data-as-base64-string';
const imagePath = `./src/assets/image${_id}.txt`;

const userModel = new UserModel();
const imageModel = new ImageModel();

beforeEach(() => {
mocked(axios.get).mockResolvedValue({
data: Buffer.from(avatarBase64, 'base64'),
});

    mocked(userModel.findOne).mockResolvedValue({
      avatar: avatarUrl,
    });

    mocked(imageModel.findOne).mockResolvedValue({
      userId: _id,
      file: imagePath,
    });

});

it('should return the saved image if it exists', async () => {
mocked(existsSync).mockReturnValueOnce(true);
mocked(readFileSync).mockReturnValueOnce(avatarBase64);

    const result = await findUserAvatar(_id);

    expect(result.userId).toBe(_id);
    expect(result.file).toBe(imagePath);
    expect(userModel.findOne).toHaveBeenCalledWith({ _id });
    expect(imageModel.findOne).toHaveBeenCalledWith({ userId: _id });
    expect(axios.get).not.toHaveBeenCalled();

});

it('should save and return the image if it does not exist', async () => {
mocked(existsSync).mockReturnValueOnce(false);

    const result = await findUserAvatar(_id);

    expect(result.userId).toBe(_id);
    expect(result.file).toBe(imagePath);
    expect(userModel.findOne).toHaveBeenCalledWith({ _id });
    expect(imageModel.findOne).toHaveBeenCalledWith({ userId: _id });
    expect(axios.get).toHaveBeenCalledWith(avatarUrl, {
      responseType: 'arraybuffer',
    });
    expect(mocked(axios.get).mock.calls[0][0]).toBe(avatarUrl);
    expect(mocked(axios.get).mock.calls[0][1]).toEqual({
      responseType: 'arraybuffer',
    });
    expect(existsSync).toHaveBeenCalledWith(imagePath);
    expect(writeFileSync).toHaveBeenCalledWith(imagePath, avatarBase64);
    expect(imageModel).toHaveBeenCalledWith({ userId: _id, file: imagePath });
    expect(mocked(imageModel).mock.instances[0].save).toHaveBeenCalled();

});
});

it('should save and return the image if it does not exist', async () => {
mocked(existsSync).mockReturnValueOnce(false);
mocked(ImageModel).mockImplementation(() => ({
userId: \_id,
file: imagePath,
save: jest.fn().mockResolvedValue({ userId: \_id, file: imagePath }),
}));

const result = await findUserAvatar(\_id);

expect(result.userId).toBe(\_id);
expect(result.file).toBe(imagePath);
expect(userModel.findOne).toHaveBeenCalledWith({ \_id });
expect(axios.get).toHaveBeenCalledWith(avatarUrl, {
responseType: 'arraybuffer',
});
expect(existsSync).toHaveBeenCalledWith(imagePath);
expect(writeFileSync).toHaveBeenCalledWith(imagePath, avatarBase64);
expect(ImageModel).toHaveBeenCalledWith({ userId: \_id, file: imagePath });
expect(mocked(ImageModel).mock.instances[0].save).toHaveBeenCalled();
});
