import { WithId } from 'mongodb';
import { Blog, BlogViewModel } from '../../../validation/types/blog';

export function mapToBlogViewModel(driver: WithId<Blog>): BlogViewModel {
  return {
    id: driver._id.toString(),
    name: driver.name,
    description: driver.description,
    websiteUrl: driver.websiteUrl,
    createdAt: driver.createdAt,
    isMembership: driver.isMembership,
  };
}
