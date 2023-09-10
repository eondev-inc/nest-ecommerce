import { PrismaError } from 'prisma-error-enum';
import { CategoryNameInUseException } from 'src/common/exceptions/category/category-name-in-use.exception';
import { CategoryNotFoundException } from 'src/common/exceptions/category/category-not-found.exception';
import { ProductNameInUseException } from 'src/common/exceptions/product/product-name-in-use.exception';
import { ProductNotFoundException } from 'src/common/exceptions/product/product-not-found.exception';
import { PurchaseNotFoundException } from 'src/common/exceptions/purchase/purchase-not-found.exception';
import { UserNotFoundException } from 'src/common/exceptions/user/user-not-found.exception';
import { ExceptionHandler } from './exception.handler';
import { PrismaClientUnknownRequestError } from '@prisma/client/runtime/library';

/** Catches Prisma ORM errors and throws the
 * respective HTTP error
 */
export class PrismaExceptionHandler implements ExceptionHandler {
  /** Catches Prisma ORM errors and throws the
   * respective HTTP error
   */
  handle(error: Error): void {
    if (error instanceof PrismaClientUnknownRequestError) {
      switch (error.stack.split('\n')[0].split(':')[0]) {
        case PrismaError.UniqueConstraintViolation:
          if (this.isProductNameConstraintViolation(error)) {
            throw new ProductNameInUseException();
          }

          if (this.isCategoryNameConstraintViolation(error)) {
            throw new CategoryNameInUseException();
          }
          break;

        case PrismaError.ForeignConstraintViolation:
          if (this.isPurchaseError(error)) {
            throw new ProductNotFoundException();
          }
          break;

        case PrismaError.RecordsNotFound:
          if (this.isUserError(error)) {
            throw new UserNotFoundException();
          }

          if (this.isProductError(error)) {
            throw new ProductNotFoundException();
          }

          if (this.isCreateProductError(error)) {
            throw new CategoryNotFoundException();
          }

          if (this.isCategoryError(error)) {
            throw new CategoryNotFoundException();
          }

          if (this.isPurchaseError(error)) {
            throw new PurchaseNotFoundException();
          }
          break;

        default:
          throw error;
      }
    }

    if (this.isPrismaUnknownError(error)) {
      if (error.message === 'No Product found') {
        throw new ProductNotFoundException();
      }

      if (error.message === 'No Category found') {
        throw new CategoryNotFoundException();
      }

      if (error.message === 'No Purchase found') {
        throw new PurchaseNotFoundException();
      }
    }
  }

  /** Checks if the error contains clientVersion,
   * making it an unknown prisma error
   * */
  private isPrismaUnknownError(error): boolean {
    return !!error.clientVersion;
  }

  /** Returns wether the error happened in the email field or not */
  private isEmailConstraintViolation(errorMeta: object): boolean {
    return Object.values(errorMeta)[0][0] === 'email';
  }

  /** Returns wether the error happened in the product name field or not */
  private isProductNameConstraintViolation(
    error: PrismaClientUnknownRequestError,
  ): boolean {
    return (
      (Object.values(error.stack)[0][0] === 'name' ||
        Object.values(error.stack)[0][0] === 'urlName') &&
      error.message.includes('prisma.product')
    );
  }

  /** Returns wether the error happened in the category name field or not */
  private isCategoryNameConstraintViolation(
    error: PrismaClientUnknownRequestError,
  ): boolean {
    return (
      Object.values(error.stack)[0][0] === 'name' &&
      error.message.includes('prisma.category')
    );
  }

  /** Returns wether the error happened on an user prisma query or not */
  private isUserError(error: PrismaClientUnknownRequestError): boolean {
    return error.message.includes('prisma.user');
  }

  /** Returns wether the error happened on an update or delete product prisma query or not */
  private isProductError(error: PrismaClientUnknownRequestError): boolean {
    return (
      error.message.includes('prisma.product.update') ||
      error.message.includes('prisma.product.delete')
    );
  }

  /** Returns wether the error happened on an create product prisma query or not */
  private isCreateProductError(
    error: PrismaClientUnknownRequestError,
  ): boolean {
    return error.message.includes('prisma.product.create');
  }

  /** Returns wether the error happened on an category prisma query or not */
  private isCategoryError(error: PrismaClientUnknownRequestError): boolean {
    return error.message.includes('prisma.category');
  }

  /** Returns wether the error happened on an purchase prisma query or not */
  private isPurchaseError(error: PrismaClientUnknownRequestError): boolean {
    return error.message.includes('prisma.purchase');
  }
}
