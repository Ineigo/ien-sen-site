import { Response } from 'express';
import Payload from './Payload';

export default interface IResponse extends Response {
    tokenData?: Payload;
}